-- db/migrations/008_attendance_validation_qr.sql
-- Tabela para fluxo de atendimento via QR Code

CREATE TABLE IF NOT EXISTS registro_atendimento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID REFERENCES monitor(id) ON DELETE SET NULL,
    matricula TEXT NOT NULL,
    nome TEXT NOT NULL,
    modalidade TEXT NOT NULL CHECK (modalidade IN ('Presencial', 'Online')),
    local_ou_link TEXT NOT NULL,
    horas_duracao NUMERIC(4,2) NOT NULL CHECK (horas_duracao > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices de performance para busca por intervalo de datas e monitor
CREATE INDEX IF NOT EXISTS idx_registro_atendimento_created_at ON registro_atendimento(created_at);
CREATE INDEX IF NOT EXISTS idx_registro_atendimento_monitor_id ON registro_atendimento(monitor_id);
