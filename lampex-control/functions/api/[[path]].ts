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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Prefer',
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

    // ROUTING AND EXECUTION
    if (resource === 'monitor') {
      if (request.method === 'GET') {
        const id = getFilterValue(url.searchParams, 'id');
        if (!id) {
          throw new Error('ID do monitor é obrigatório.');
        }
        const query = `
          SELECT id, nome, email, role, telefone, permite_exibir_contato, plataforma_contato, matriz_disponibilidade 
          FROM monitor 
          WHERE id = $1
        `;
        const { rows } = await client.query(query, [id]);
        
        return new Response(JSON.stringify(isSingleObject ? (rows[0] || null) : rows), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

      } else if (request.method === 'PATCH') {
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

    } else if (resource === 'solicitacoes_monitoria') {
      if (request.method === 'POST') {
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
      }

    } else if (resource === 'rpc/registro_horas') {
      if (request.method === 'POST') {
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

    } else if (resource === 'view_reuniao_geral') {
      if (request.method === 'GET') {
        const query = `SELECT * FROM view_heatmap_disponibilidade`;
        const { rows } = await client.query(query);

        return new Response(JSON.stringify(rows), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

    } else if (resource === 'view_contato_monitor') {
      if (request.method === 'GET') {
        const cpfAluno = getFilterValue(url.searchParams, 'cpf_aluno');
        if (!cpfAluno) {
          throw new Error('CPF do aluno é obrigatório.');
        }

        const query = `
          SELECT * FROM view_contato_monitor 
          WHERE cpf_aluno = $1 
          ORDER BY chamado_id DESC 
          LIMIT 1
        `;
        const { rows } = await client.query(query, [cpfAluno.replace(/\D/g, '')]);

        return new Response(JSON.stringify(isSingleObject ? (rows[0] || null) : rows), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
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
