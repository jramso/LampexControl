import pg from 'pg';

export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  HYPERDRIVE?: {
    connectionString: string;
  };
}

// Helper nativo para gerar JWT HS256 utilizando Web Cryptography API
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  try {
    const body: any = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'E-mail e senha são obrigatórios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Resolvendo a string de conexão (priorizando Hyperdrive)
    const connectionString = env.HYPERDRIVE ? env.HYPERDRIVE.connectionString : env.DATABASE_URL;

    if (!connectionString) {
      return new Response(JSON.stringify({ error: 'Nenhuma conexão com o banco de dados configurada no Cloudflare Pages.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Conectar ao banco usando o driver pg do node
    const client = new pg.Client({
      connectionString,
      ssl: env.HYPERDRIVE ? undefined : { rejectUnauthorized: false }
    });

    await client.connect();

    // Validar e-mail e conferir hash da senha usando crypt da pgcrypto
    const query = `
      SELECT id, nome, email, role, (senha_hash = crypt($2, senha_hash)) AS password_ok
      FROM monitor
      WHERE email = $1;
    `;
    const { rows } = await client.query(query, [email, password]);
    await client.end();

    if (rows.length === 0 || !rows[0].password_ok) {
      return new Response(JSON.stringify({ error: 'E-mail ou senha incorretos.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
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
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: `Erro interno do servidor: ${err.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

// Tratar preflight CORS (OPTIONS)
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
};
