-- db/migrations/007_add_gestores.sql
-- Inserir gestores adicionais oficiais para o projeto

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
    'Bruno Gestor', 
    'bruno@ifes.edu.br', 
    crypt('lampex123', gen_salt('bf')), 
    'gestor', 
    '27999999999', 
    'WhatsApp', 
    true
),
(
    'Emmanuel Gestor', 
    'emmanuel@ifes.edu.br', 
    crypt('lampex123', gen_salt('bf')), 
    'gestor', 
    '27999999999', 
    'WhatsApp', 
    true
),
(
    'Gestor', 
    'gestor@ifes.edu.br', 
    crypt('lampex123', gen_salt('bf')), 
    'gestor', 
    '27999999999', 
    'WhatsApp', 
    true
)
ON CONFLICT (email) DO NOTHING;
