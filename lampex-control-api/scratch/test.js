import pg from 'pg';

const connectionString = 'postgresql://avnadmin:PLACEHOLDER_PASSWORD@lampexcontroldb-lampexcontrol.c.aivencloud.com:11028/defaultdb';

async function test() {
  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Conectado!');
    
    // 1. Aplicar a migração
    console.log('Aplicando migração 012...');
    await client.query(`
      ALTER TABLE registro_atendimento 
      ADD COLUMN IF NOT EXISTS monitoria_professor_id UUID REFERENCES monitoria_professor(id) ON DELETE SET NULL;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_registro_atendimento_monitoria_prof ON registro_atendimento(monitoria_professor_id);
    `);
    console.log('Migração aplicada com sucesso!');

    // 2. Inserir o professor
    console.log('Inserindo professor...');
    const res = await client.query(`
      INSERT INTO usuario (nome, email, senha_hash, role, telefone, plataforma_contato, permite_exibir_contato, matricula)
      VALUES (
        'Professor', 
        'professor@ifes.edu.br', 
        crypt('lampex123', gen_salt('bf')), 
        'professor', 
        '27999999999', 
        'WhatsApp', 
        true, 
        '20261PROF0001'
      )
      ON CONFLICT (email) DO UPDATE 
      SET senha_hash = crypt('lampex123', gen_salt('bf')), role = 'professor'
      RETURNING id, nome, email, role;
    `);
    console.log('Professor cadastrado:', res.rows[0]);
    
  } catch (err) {
    console.error('Erro:', err);
  } finally {
    await client.end();
  }
}

test();
