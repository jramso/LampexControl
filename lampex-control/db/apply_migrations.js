import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Carrega variáveis de ambiente do arquivo .env nativamente (Node 20+)
try {
  process.loadEnvFile();
} catch (e) {
  // Ignora se o arquivo .env não existir (usará variáveis de ambiente do SO)
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Erro: A variável DATABASE_URL não foi encontrada no .env ou no ambiente.');
  process.exit(1);
}

// Remove os parâmetros de query string (como sslmode=require) para tratamento manual do SSL no pg client
const cleanConnectionString = connectionString.split('?')[0];

async function run() {
  const client = new pg.Client({
    connectionString: cleanConnectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Conectando ao banco de dados Aiven...');
    await client.connect();
    console.log('Conexão estabelecida com sucesso!');

    const baseDir = '.';
    
    // 1. Executar 001_init_schema.sql
    console.log('Aplicando migração 001_init_schema.sql...');
    const schemaSql = fs.readFileSync(path.join(baseDir, 'db/migrations/001_init_schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('Esquema de tabelas e índices criados com sucesso!');

    // 2. Executar 002_triggers_and_rules.sql
    console.log('Aplicando migração 002_triggers_and_rules.sql...');
    const triggersSql = fs.readFileSync(path.join(baseDir, 'db/migrations/002_triggers_and_rules.sql'), 'utf8');
    await client.query(triggersSql);
    console.log('Triggers, JWT, View e Rate Limiting configurados com sucesso!');

    // 3. Executar 003_api_mappings.sql
    console.log('Aplicando migração 003_api_mappings.sql...');
    const mappingsSql = fs.readFileSync(path.join(baseDir, 'db/migrations/003_api_mappings.sql'), 'utf8');
    await client.query(mappingsSql);
    console.log('Aliases e views da API mapeados com sucesso!');

    // 4. Executar 004_seed_data.sql
    console.log('Aplicando seed 004_seed_data.sql...');
    const seedSql = fs.readFileSync(path.join(baseDir, 'db/migrations/004_seed_data.sql'), 'utf8');
    await client.query(seedSql);
    console.log('Seed de dados efetuado com sucesso!');

    // 5. Executar 005_volunteer_screening.sql
    console.log('Aplicando migração 005_volunteer_screening.sql...');
    const screeningSql = fs.readFileSync(path.join(baseDir, 'db/migrations/005_volunteer_screening.sql'), 'utf8');
    await client.query(screeningSql);
    console.log('Triagem de voluntários configurada com sucesso!');

  } catch (err) {
    console.error('Erro na migração:', err);
  } finally {
    await client.end();
    console.log('Conexão encerrada.');
  }
}

run();
