-- db/migrations/004_seed_data.sql
-- Seed de dados iniciais para testes locais no Docker

INSERT INTO monitor (
    nome, 
    email, 
    senha_hash, 
    role, 
    telefone, 
    plataforma_contato, 
    permite_exibir_contato,
    matricula
) VALUES 
(
    'Josué Ramos Souza', 
    'josue.rsou2@gmail.com', 
    crypt('lampex123', gen_salt('bf')), 
    'gestor_fixo', 
    '27999999999', 
    'WhatsApp', 
    true,
    '20261BSI0000'
),
(
    'Monitor de Testes', 
    'monitor@ifes.edu.br', 
    crypt('lampex123', gen_salt('bf')), 
    'voluntario', 
    '27999999999', 
    'WhatsApp', 
    true,
    '20261BSI0001'
)
ON CONFLICT (email) DO NOTHING;
