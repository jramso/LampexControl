-- db/migrations/009_add_monitor_matricula.sql
-- Adiciona a coluna matricula na tabela monitor para permitir identificação por código

ALTER TABLE monitor ADD COLUMN IF NOT EXISTS matricula TEXT;

-- Atualiza registros existentes que não possuem matrícula
UPDATE monitor SET matricula = '20261BSI0001' WHERE role = 'monitor' AND matricula IS NULL;
UPDATE monitor SET matricula = '20261BSI0000' WHERE role = 'gestor' AND matricula IS NULL;
