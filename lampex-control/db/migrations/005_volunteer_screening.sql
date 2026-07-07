-- db/migrations/005_volunteer_screening.sql
-- Tabela para o Fluxo de Triagem de Potenciais Voluntários

CREATE TABLE IF NOT EXISTS potencial_voluntario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    telefone TEXT NOT NULL,
    curso TEXT NOT NULL,
    matricula TEXT UNIQUE NOT NULL,
    origem_cadastro TEXT CHECK (origem_cadastro IN (
        'Instagram', 
        'Youtube', 
        'Professores ou colegas de turma', 
        'Membros da Equipe Executora do Projeto Lampex', 
        'Avisos do Ifes'
    )),
    status_aprovacao TEXT NOT NULL DEFAULT 'Pendente' CHECK (status_aprovacao IN ('Pendente', 'Aprovado', 'Rejeitado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices de Otimização e Performance
CREATE INDEX IF NOT EXISTS idx_potencial_voluntario_email ON potencial_voluntario(email);
CREATE INDEX IF NOT EXISTS idx_potencial_voluntario_cpf ON potencial_voluntario(cpf);
CREATE INDEX IF NOT EXISTS idx_potencial_voluntario_matricula ON potencial_voluntario(matricula);
CREATE INDEX IF NOT EXISTS idx_potencial_voluntario_status ON potencial_voluntario(status_aprovacao);
