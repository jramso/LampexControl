-- db/migrations/012_add_monitoria_professor_id_to_attendance.sql
-- Adicionar coluna para vincular o atendimento (registro_atendimento) à sessão/aula do professor (monitoria_professor)

ALTER TABLE registro_atendimento 
ADD COLUMN IF NOT EXISTS monitoria_professor_id UUID REFERENCES monitoria_professor(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_registro_atendimento_monitoria_prof ON registro_atendimento(monitoria_professor_id);
