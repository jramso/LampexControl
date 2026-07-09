-- db/migrations/010_role_replan_monitoring.sql
-- 1. Atualizar o check constraint de roles na tabela monitor
ALTER TABLE monitor DROP CONSTRAINT IF EXISTS monitor_role_check;

UPDATE monitor SET role = 'voluntario' WHERE role = 'monitor';
UPDATE monitor SET role = 'gestor_fixo' WHERE role = 'gestor';

ALTER TABLE monitor ADD CONSTRAINT monitor_role_check 
    CHECK (role IN ('voluntario', 'professor', 'gestor_fixo', 'gestor_temporario'));

-- 2. Atualizar o check constraint de modalidade na tabela registro_atendimento
ALTER TABLE registro_atendimento DROP CONSTRAINT IF EXISTS registro_atendimento_modalidade_check;
ALTER TABLE registro_atendimento ADD CONSTRAINT registro_atendimento_modalidade_check 
    CHECK (modalidade IN ('Presencial', 'Online', 'Presencial com Professor'));

-- 3. Criar a tabela monitoria_professor para senhas de aula do professor
CREATE TABLE IF NOT EXISTS monitoria_professor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID NOT NULL REFERENCES monitor(id) ON DELETE CASCADE,
    senha_aula TEXT NOT NULL,
    data_aula DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Fechado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_monitoria_professor_data ON monitoria_professor(data_aula);
CREATE INDEX IF NOT EXISTS idx_monitoria_professor_prof_status ON monitoria_professor(professor_id, status);
