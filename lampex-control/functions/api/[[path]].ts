import pg from 'pg';

export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  HYPERDRIVE?: {
    connectionString: string;
  };
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

function getFilterValue(searchParams: URLSearchParams, key: string): string | null {
  const param = searchParams.get(key);
  if (!param) return null;
  if (param.startsWith('eq.')) {
    return param.substring(3);
  }
  return param;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);

  // Extract path segment (e.g. "monitor", "solicitacoes_monitoria", "rpc/registro_horas")
  const pathSegments = params.path as string[];
  const resource = pathSegments ? pathSegments.join('/') : '';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Prefer, Accept',
    'Access-Control-Max-Age': '86400',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

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
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
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
      await client.query("SELECT set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ id: claims.id, role: claims.role, email: claims.email })
      ]);
    }

    const acceptHeader = request.headers.get('Accept') || '';
    const isSingleObject = acceptHeader.includes('application/vnd.pgrst.object+json');

    // POST / RPC Requests
    if (request.method === 'POST') {
      if (resource === 'solicitacoes_monitoria') {
        const body: any = await request.json();
        const { nome_aluno, email_aluno, telefone_aluno, cpf_aluno, descricao_duvida, formato, horarios_disponiveis } = body;

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
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

      } else if (resource === 'historico_auditoria') {
        const body: any = await request.json();
        const { registro_semanal_id, gestor_id, status_auditoria, justificativa } = body;
        const query = `
          INSERT INTO historico_auditoria (registro_semanal_id, gestor_id, status_auditoria, justificativa)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        const { rows } = await client.query(query, [registro_semanal_id, gestor_id, status_auditoria, justificativa]);
        return new Response(JSON.stringify(isSingleObject ? (rows[0] || null) : rows), {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

      } else if (resource === 'rpc/registro_horas') {
        if (!claims) {
          return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        const body: any = await request.json();
        const { semana_ref, pdf_url, atividades } = body;

        const query = `SELECT registro_horas($1::date, $2::text, $3::jsonb) AS id`;
        const { rows } = await client.query(query, [semana_ref, pdf_url, JSON.stringify(atividades)]);

        return new Response(JSON.stringify(rows[0] ? rows[0].id : null), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
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
      const { nome, telefone, permite_exibir_contato, plataforma_contato, matriz_disponibilidade } = body;

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
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // GET Requests
    if (request.method === 'GET') {
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
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
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
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Default 404
    return new Response(JSON.stringify({ error: `Rota não encontrada: ${resource}` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Erro interno do servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } finally {
    await client.end();
  }
};
