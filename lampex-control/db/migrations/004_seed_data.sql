-- db/migrations/004_seed_data.sql
-- Seed de dados iniciais para testes locais no Docker

INSERT INTO monitor (
    nome, 
    email, 
    senha_hash, 
    role, 
    telefone, 
    plataforma_contato, 
    permite_exibir_contato
) VALUES 
(
    'Josué Ramos Souza', 
    'josue.rsou2@gmail.com', 
    crypt('lampex123', gen_salt('bf')), 
    'gestor', 
    '27999999999', 
    'WhatsApp', 
    true
),
(
    'Monitor de Testes', 
    'monitor@ifes.edu.br', 
    crypt('lampex123', gen_salt('bf')), 
    'monitor', 
    '27999999999', 
    'WhatsApp', 
    true
)
ON CONFLICT (email) DO NOTHING;
