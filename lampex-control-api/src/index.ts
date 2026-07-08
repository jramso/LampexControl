import pg from 'pg';

export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  HYPERDRIVE?: {
    connectionString: string;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Prefer, Accept',
  'Access-Control-Max-Age': '86400',
};

// Helper to append CORS headers to all responses
function handleCors(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

async function verifyJwt(token: string, secret: string): Promise<any | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const message = `${header}.${payload}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const base64 = signature.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLen);
    const signatureBytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      messageData
    );

    if (!isValid) return null;

    const decodedPayloadStr = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(decodedPayloadStr);

    if (claims.exp && claims.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return claims;
  } catch (e) {
    return null;
  }
}

async function signJwt(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const toBase64Url = (obj: any) => {
    const json = JSON.stringify(obj);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };

  const encodedHeader = toBase64Url(header);
  const encodedPayload = toBase64Url(payload);
  const message = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  const binarySignature = String.fromCharCode(...signatureArray);
  const encodedSignature = btoa(binarySignature).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${message}.${encodedSignature}`;
}

function getFilterValue(searchParams: URLSearchParams, key: string): string | null {
  const param = searchParams.get(key);
  if (!param) return null;
  if (param.startsWith('eq.')) {
    return param.substring(3);
  }
  return param;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 1. Handle Preflight Options Request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      const response = await handleRequest(request, env);
      return handleCors(response);
    } catch (err: any) {
      return handleCors(
        new Response(JSON.stringify({ error: err.message || 'Erro interno do servidor.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }
  }
};

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  let pathname = url.pathname;

  // Normalize path and support both /api/resource and /resource formats
  if (pathname.startsWith('/api')) {
    pathname = pathname.substring(4);
  }

  // Remove leading and trailing slashes
  const resource = pathname.replace(/^\/+|\/+$/g, '');

  // Route auth/login specifically
  if (resource === 'auth/login') {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido.' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return handleLogin(request, env);
  }

  // Route all other requests to PostgreSQL (PostgREST style)
  return handleDatabaseRoute(resource, request, env, url);
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const body: any = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'E-mail e senha são obrigatórios.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const connectionString = env.HYPERDRIVE ? env.HYPERDRIVE.connectionString : env.DATABASE_URL;

  if (!connectionString) {
    return new Response(JSON.stringify({ error: 'Nenhuma conexão com o banco de dados configurada.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const client = new pg.Client({
    connectionString,
    ssl: env.HYPERDRIVE ? undefined : { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    const query = `
      SELECT id, nome, email, role, (senha_hash = crypt($2, senha_hash)) AS password_ok
      FROM monitor
      WHERE email = $1;
    `;
    const { rows } = await client.query(query, [email, password]);

    if (rows.length === 0 || !rows[0].password_ok) {
      return new Response(JSON.stringify({ error: 'E-mail ou senha incorretos.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = rows[0];
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: expirationTime
    };

    const token = await signJwt(tokenPayload, env.JWT_SECRET || 'your_jwt_secret_here');

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await client.end();
  }
}

async function handleDatabaseRoute(resource: string, request: Request, env: Env, url: URL): Promise<Response> {
  const resourceParts = resource.split('/');
  // Auth check
  const authHeader = request.headers.get('Authorization');
  let claims: any = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    claims = await verifyJwt(token, env.JWT_SECRET || 'your_jwt_secret_here');
  }

  const connectionString = env.HYPERDRIVE ? env.HYPERDRIVE.connectionString : env.DATABASE_URL;
  if (!connectionString) {
    return new Response(JSON.stringify({ error: 'Nenhuma conexão com o banco de dados configurada.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const client = new pg.Client({
    connectionString,
    ssl: env.HYPERDRIVE ? undefined : { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Set RLS / JWT claims in the session so Postgres triggers/functions can read them (like PostgREST does)
    if (claims) {
      await client.query("SELECT set_config('request.jwt.claims', $1, false)", [
        JSON.stringify({ id: claims.id, role: claims.role, email: claims.email })
      ]);
    }

    const acceptHeader = request.headers.get('Accept') || '';
    const isSingleObject = acceptHeader.includes('application/vnd.pgrst.object+json');

    // POST / RPC Requests
    if (request.method === 'POST') {
      if (resource === 'voluntarios/cadastro') {
        const body: any = await request.json();
        const payload = Array.isArray(body) ? body[0] : body;
        const { nome, email, cpf, telefone, curso, matricula, origem_cadastro } = payload;

        if (!nome || !email || !cpf || !telefone || !curso || !matricula || !origem_cadastro) {
          return new Response(JSON.stringify({ error: 'Todos os campos são obrigatórios.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const cleanCpf = cpf.replace(/\D/g, '');
        if (cleanCpf.length !== 11) {
          return new Response(JSON.stringify({ error: 'CPF deve conter exatamente 11 dígitos.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const validOrigens = [
          'Instagram', 
          'Youtube', 
          'Professores ou colegas de turma', 
          'Membros da Equipe Executora do Projeto Lampex', 
          'Avisos do Ifes'
        ];
        if (!validOrigens.includes(origem_cadastro)) {
          return new Response(JSON.stringify({ error: 'Origem do cadastro inválida.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Check duplicates
        const checkEmailMonitor = await client.query('SELECT 1 FROM monitor WHERE email = $1', [email]);
        if (checkEmailMonitor.rows.length > 0) {
          return new Response(JSON.stringify({ error: 'Este e-mail já pertence a um monitor cadastrado.' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const checkVoluntario = await client.query(
          'SELECT 1 FROM potencial_voluntario WHERE email = $1 OR cpf = $2 OR matricula = $3',
          [email, cleanCpf, matricula]
        );
        if (checkVoluntario.rows.length > 0) {
          return new Response(JSON.stringify({ error: 'E-mail, CPF ou Matrícula já cadastrados na triagem.' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const query = `
          INSERT INTO potencial_voluntario (nome, email, cpf, telefone, curso, matricula, origem_cadastro, status_aprovacao)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pendente')
          RETURNING *
        `;
        const { rows } = await client.query(query, [
          nome, email, cleanCpf, telefone, curso, matricula, origem_cadastro
        ]);

        return new Response(JSON.stringify(rows[0]), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });

      } else if (resourceParts[0] === 'voluntarios' && resourceParts.length === 3 && resourceParts[2] === 'aprovar') {
        if (!claims || claims.role !== 'gestor') {
          return new Response(JSON.stringify({ error: 'Acesso negado. Apenas gestores podem aprovar candidatos.' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const id = resourceParts[1];

        // Check if exists and is Pendente
        const { rows: voluntarioRows } = await client.query(
          'SELECT nome, email, cpf, telefone, matricula, status_aprovacao FROM potencial_voluntario WHERE id = $1',
          [id]
        );

        if (voluntarioRows.length === 0) {
          return new Response(JSON.stringify({ error: 'Candidato não encontrado.' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const voluntario = voluntarioRows[0];
        if (voluntario.status_aprovacao !== 'Pendente') {
          return new Response(JSON.stringify({ error: 'Candidato já foi processado (Aprovado ou Rejeitado).' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Check if email already exists in monitor before migrating
        const { rows: existingMonitor } = await client.query('SELECT 1 FROM monitor WHERE email = $1', [voluntario.email]);
        if (existingMonitor.length > 0) {
          return new Response(JSON.stringify({ error: 'Este e-mail já está cadastrado na tabela de monitores.' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // SQL Transaction
        try {
          await client.query('BEGIN');

          await client.query(
            "UPDATE potencial_voluntario SET status_aprovacao = 'Aprovado' WHERE id = $1",
            [id]
          );

          const defaultPassword = `Lampex@${voluntario.matricula}`;
          const insertQuery = `
            INSERT INTO monitor (nome, email, senha_hash, telefone, permite_exibir_contato, role)
            VALUES ($1, $2, public.crypt($3, public.gen_salt('bf')), $4, FALSE, 'monitor')
            RETURNING id
          `;
          const { rows: monitorRows } = await client.query(insertQuery, [
            voluntario.nome, voluntario.email, defaultPassword, voluntario.telefone
          ]);

          await client.query('COMMIT');

          return new Response(JSON.stringify({
            success: true,
            message: 'Candidato aprovado e monitor criado com sucesso.',
            monitor_id: monitorRows[0].id
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });

        } catch (txErr: any) {
          await client.query('ROLLBACK');
          return new Response(JSON.stringify({ error: `Erro na transação de aprovação: ${txErr.message}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

      } else if (resourceParts[0] === 'voluntarios' && resourceParts.length === 3 && resourceParts[2] === 'rejeitar') {
        if (!claims || claims.role !== 'gestor') {
          return new Response(JSON.stringify({ error: 'Acesso negado. Apenas gestores podem rejeitar candidatos.' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const id = resourceParts[1];

        const { rows } = await client.query(
          "UPDATE potencial_voluntario SET status_aprovacao = 'Rejeitado' WHERE id = $1 AND status_aprovacao = 'Pendente' RETURNING id",
          [id]
        );

        if (rows.length === 0) {
          return new Response(JSON.stringify({ error: 'Candidato não encontrado ou já processado.' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Candidato rejeitado com sucesso.'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      } else if (resource === 'solicitacoes_monitoria') {
        const body: any = await request.json();
        const payload = Array.isArray(body) ? body[0] : body;
        const { nome_aluno, email_aluno, telefone_aluno, cpf_aluno, descricao_duvida, formato, horarios_disponiveis } = payload;

        const query = `
          INSERT INTO solicitacao_monitoria (nome_aluno, email_aluno, telefone_aluno, cpf_aluno, descricao_duvida, formato, horarios_disponiveis, status) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pendente') 
          RETURNING *
        `;
        const { rows } = await client.query(query, [
          nome_aluno, email_aluno, telefone_aluno, cpf_aluno, descricao_duvida, formato, JSON.stringify(horarios_disponiveis)
        ]);

        return new Response(JSON.stringify(isSingleObject ? (rows[0] || null) : rows), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });

      } else if (resource === 'historico_auditoria') {
        const body: any = await request.json();
        const payload = Array.isArray(body) ? body[0] : body;
        const { registro_semanal_id, gestor_id, status_auditoria, justificativa } = payload;
        const query = `
          INSERT INTO historico_auditoria (registro_semanal_id, gestor_id, status_auditoria, justificativa)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        const { rows } = await client.query(query, [registro_semanal_id, gestor_id, status_auditoria, justificativa]);
        return new Response(JSON.stringify(isSingleObject ? (rows[0] || null) : rows), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });

      } else if (resource === 'rpc/registro_horas') {
        if (!claims) {
          return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        const body: any = await request.json();
        const { semana_ref, pdf_url, atividades } = body;

        const query = `SELECT registro_horas($1::date, $2::text, $3::jsonb) AS id`;
        const { rows } = await client.query(query, [semana_ref, pdf_url, JSON.stringify(atividades)]);

        return new Response(JSON.stringify(rows[0] ? rows[0].id : null), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // PATCH Requests
    if (request.method === 'PATCH' && resource === 'monitor') {
      const id = getFilterValue(url.searchParams, 'id');
      if (!id) {
        throw new Error('ID do monitor é obrigatório.');
      }
      const body: any = await request.json();
      const payload = Array.isArray(body) ? body[0] : body;
      const { nome, telefone, permite_exibir_contato, plataforma_contato, matriz_disponibilidade } = payload;

      const query = `
        UPDATE monitor 
        SET nome = $1, telefone = $2, permite_exibir_contato = $3, plataforma_contato = $4, matriz_disponibilidade = $5 
        WHERE id = $6 
        RETURNING id, nome, email, role, telefone, permite_exibir_contato, plataforma_contato, matriz_disponibilidade
      `;
      const { rows } = await client.query(query, [
        nome, telefone, permite_exibir_contato, plataforma_contato, JSON.stringify(matriz_disponibilidade), id
      ]);

      return new Response(JSON.stringify(isSingleObject ? (rows[0] || null) : rows), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // GET Requests
    if (request.method === 'GET') {
      if (resource === 'voluntarios/pendentes') {
        if (!claims || claims.role !== 'gestor') {
          return new Response(JSON.stringify({ error: 'Acesso negado. Apenas gestores podem visualizar candidatos pendentes.' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const query = `
          SELECT id, nome, email, cpf, telefone, curso, matricula, origem_cadastro, status_aprovacao, created_at
          FROM potencial_voluntario
          WHERE status_aprovacao = 'Pendente'
          ORDER BY created_at ASC
        `;
        const { rows } = await client.query(query);
        return new Response(JSON.stringify(rows), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      let tableName = resource;
      if (resource === 'solicitacao_monitoria') tableName = 'solicitacao_monitoria';
      if (resource === 'view_reuniao_geral') tableName = 'view_heatmap_disponibilidade';

      let sql = '';
      let values: any[] = [];
      let whereClauses: string[] = [];

      const idEq = getFilterValue(url.searchParams, 'id');
      if (idEq) {
        values.push(idEq);
        whereClauses.push(`id = $${values.length}`);
      }

      const cpfEq = getFilterValue(url.searchParams, 'cpf_aluno');
      if (cpfEq) {
        values.push(cpfEq);
        whereClauses.push(`cpf_aluno = $${values.length}`);
      }

      const statusAuditoriaEq = getFilterValue(url.searchParams, 'status_auditoria');
      if (statusAuditoriaEq) {
        values.push(statusAuditoriaEq);
        whereClauses.push(`status_auditoria = $${values.length}`);
      }

      const idIn = url.searchParams.get('id');
      if (idIn && idIn.startsWith('in.(') && idIn.endsWith(')')) {
        const list = idIn.substring(4, idIn.length - 1).split(',').map(s => s.trim());
        values.push(list);
        whereClauses.push(`id = ANY($${values.length})`);
      }

      if (tableName === 'registro_semanal') {
        sql = `
          SELECT 
              r.id, 
              r.semana_referencia, 
              r.arquivo_pdf_url, 
              r.created_at,
              r.monitor_id,
              jsonb_build_object(
                'id', m.id,
                'nome', m.nome,
                'email', m.email,
                'role', m.role
              ) AS monitor,
              COALESCE(
                  jsonb_agg(
                      jsonb_build_object(
                          'id', a.id,
                          'tipo_atividade', a.tipo_atividade,
                          'horas_brutas', a.horas_brutas,
                          'horas_liquidas', a.horas_liquidas,
                          'evidencia_url', a.evidencia_url
                      )
                  ) FILTER (WHERE a.id IS NOT NULL), 
                  '[]'::jsonb
              ) AS item_atividade
          FROM registro_semanal r
          JOIN monitor m ON r.monitor_id = m.id
          LEFT JOIN item_atividade a ON a.registro_semanal_id = r.id
        `;
        if (whereClauses.length > 0) {
          sql += ` WHERE ` + whereClauses.map(c => c.replace('id = ', 'r.id = ')).join(' AND ');
        }
        sql += ` GROUP BY r.id, m.id, m.nome, m.email, m.role`;

      } else if (tableName === 'historico_auditoria') {
        sql = `SELECT id, registro_semanal_id, gestor_id, status_auditoria, justificativa, data_hora_acao FROM historico_auditoria`;
        if (whereClauses.length > 0) {
          sql += ` WHERE ` + whereClauses.join(' AND ');
        }
      } else if (tableName === 'monitor') {
        sql = `SELECT id, nome, email, role, telefone, permite_exibir_contato, plataforma_contato, matriz_disponibilidade FROM monitor`;
        if (whereClauses.length > 0) {
          sql += ` WHERE ` + whereClauses.join(' AND ');
        }
      } else if (tableName === 'solicitacao_monitoria') {
        sql = `SELECT id, nome_aluno, email_aluno, telefone_aluno, cpf_aluno, descricao_duvida, formato, horarios_disponiveis, status, monitor_responsavel_id, created_at FROM solicitacao_monitoria`;
        if (whereClauses.length > 0) {
          sql += ` WHERE ` + whereClauses.join(' AND ');
        }
      } else if (tableName === 'view_heatmap_disponibilidade') {
        sql = `SELECT dia_semana, bloco_horario, peso_total FROM view_heatmap_disponibilidade`;
      } else if (tableName === 'view_contato_monitor') {
        sql = `SELECT chamado_id, cpf_aluno, monitor_id, monitor_nome, monitor_telefone, monitor_plataforma FROM view_contato_monitor`;
        if (whereClauses.length > 0) {
          sql += ` WHERE ` + whereClauses.join(' AND ');
        }
      }

      if (!sql) {
        return new Response(JSON.stringify({ error: `Recurso desconhecido: ${resource}` }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Order By
      const order = url.searchParams.get('order');
      if (order) {
        const orderParts = order.split('.');
        const field = orderParts[0];
        const direction = orderParts[1] === 'desc' ? 'DESC' : 'ASC';
        const validFields = ['created_at', 'id', 'chamado_id'];
        if (validFields.includes(field)) {
          sql += ` ORDER BY ${field} ${direction}`;
        }
      }

      // Limit
      const limit = url.searchParams.get('limit');
      if (limit) {
        const limitNum = parseInt(limit, 10);
        if (!isNaN(limitNum)) {
          sql += ` LIMIT ${limitNum}`;
        }
      }

      const { rows } = await client.query(sql, values);
      return new Response(JSON.stringify(isSingleObject ? (rows[0] || null) : rows), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Default 404
    return new Response(JSON.stringify({ error: `Rota não encontrada: ${resource}` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });

  } finally {
    await client.end();
  }
}
