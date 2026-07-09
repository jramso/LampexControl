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

    // 6. Executar 006_make_pdf_url_nullable.sql
    console.log('Aplicando migração 006_make_pdf_url_nullable.sql...');
    const makeNullableSql = fs.readFileSync(path.join(baseDir, 'db/migrations/006_make_pdf_url_nullable.sql'), 'utf8');
    await client.query(makeNullableSql);
    console.log('Campo de PDF tornado opcional com sucesso!');

    // 7. Executar 007_add_gestores.sql
    console.log('Aplicando migração 007_add_gestores.sql...');
    const addGestoresSql = fs.readFileSync(path.join(baseDir, 'db/migrations/007_add_gestores.sql'), 'utf8');
    await client.query(addGestoresSql);
    console.log('Gestores adicionais criados com sucesso!');

    // 8. Executar 008_attendance_validation_qr.sql
    console.log('Aplicando migração 008_attendance_validation_qr.sql...');
    const qrAttendanceSql = fs.readFileSync(path.join(baseDir, 'db/migrations/008_attendance_validation_qr.sql'), 'utf8');
    await client.query(qrAttendanceSql);
    console.log('Tabela de registro_atendimento criada com sucesso!');

    // 9. Executar 009_add_monitor_matricula.sql
    console.log('Aplicando migração 009_add_monitor_matricula.sql...');
    const monitorMatriculaSql = fs.readFileSync(path.join(baseDir, 'db/migrations/009_add_monitor_matricula.sql'), 'utf8');
    await client.query(monitorMatriculaSql);
    console.log('Coluna matricula adicionada à tabela monitor com sucesso!');

    // 10. Executar 010_role_replan_monitoring.sql
    console.log('Aplicando migração 010_role_replan_monitoring.sql...');
    const roleReplanSql = fs.readFileSync(path.join(baseDir, 'db/migrations/010_role_replan_monitoring.sql'), 'utf8');
    await client.query(roleReplanSql);
    console.log('Roles replanejadas, nova tabela monitoria_professor criada com sucesso!');

    // 11. Executar 011_rename_monitor_to_usuario.sql
    console.log('Aplicando migração 011_rename_monitor_to_usuario.sql...');
    const renameToUsuarioSql = fs.readFileSync(path.join(baseDir, 'db/migrations/011_rename_monitor_to_usuario.sql'), 'utf8');
    await client.query(renameToUsuarioSql);
    console.log('Tabela monitor renomeada para usuario e dependências atualizadas!');

    // 12. Executar 012_add_monitoria_professor_id_to_attendance.sql
    console.log('Aplicando migração 012_add_monitoria_professor_id_to_attendance.sql...');
    const addMonitoriaProfSql = fs.readFileSync(path.join(baseDir, 'db/migrations/012_add_monitoria_professor_id_to_attendance.sql'), 'utf8');
    await client.query(addMonitoriaProfSql);
    console.log('Coluna monitoria_professor_id adicionada à registro_atendimento!');

    // 13. Executar 013_extension_governance.sql
    console.log('Aplicando migração 013_extension_governance.sql...');
    const extensionGovSql = fs.readFileSync(path.join(baseDir, 'db/migrations/013_extension_governance.sql'), 'utf8');
    await client.query(extensionGovSql);
    console.log('Governança de ações de extensão aplicada com sucesso!');

  } catch (err) {
    console.error('Erro na migração:', err);
  } finally {
    await client.end();
    console.log('Conexão encerrada.');
  }
}

run();
