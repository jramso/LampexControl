-- db/migrations/001_init_schema.sql
-- Inicialização do esquema de tabelas do LampexControl

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Tabela monitor
CREATE TABLE IF NOT EXISTS monitor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    telefone TEXT NOT NULL,
    permite_exibir_contato BOOLEAN NOT NULL DEFAULT FALSE,
    plataforma_contato TEXT CHECK (plataforma_contato IN ('WhatsApp', 'Discord', 'Telegram', 'Outro')),
    matriz_disponibilidade JSONB NOT NULL DEFAULT '{}'::jsonb,
    role TEXT NOT NULL DEFAULT 'monitor' CHECK (role IN ('monitor', 'gestor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela solicitacao_monitoria
CREATE TABLE IF NOT EXISTS solicitacao_monitoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_aluno TEXT NOT NULL,
    email_aluno TEXT NOT NULL,
    telefone_aluno TEXT NOT NULL,
    cpf_aluno VARCHAR(11) NOT NULL CHECK (length(cpf_aluno) = 11),
    descricao_duvida TEXT NOT NULL,
    formato TEXT NOT NULL CHECK (formato IN ('Presencial', 'Online')),
    horarios_disponiveis JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Confirmado', 'Cancelado')),
    monitor_responsavel_id UUID REFERENCES monitor(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela registro_semanal
CREATE TABLE IF NOT EXISTS registro_semanal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL REFERENCES monitor(id) ON DELETE CASCADE,
    semana_referencia DATE NOT NULL,
    arquivo_pdf_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_semana_monitor UNIQUE (monitor_id, semana_referencia)
);

-- 4. Tabela item_atividade
CREATE TABLE IF NOT EXISTS item_atividade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registro_semanal_id UUID NOT NULL REFERENCES registro_semanal(id) ON DELETE CASCADE,
    tipo_atividade TEXT NOT NULL CHECK (tipo_atividade IN ('Monitoria', 'Minicurso com Material', 'Minicurso sem Material', 'Marketing Digital', 'Desenvolvimento', 'Outros')),
    horas_brutas NUMERIC(4,2) NOT NULL CHECK (horas_brutas > 0),
    horas_liquidas NUMERIC(4,2) NOT NULL,
    evidencia_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela historico_auditoria
CREATE TABLE IF NOT EXISTS historico_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registro_semanal_id UUID NOT NULL REFERENCES registro_semanal(id) ON DELETE CASCADE,
    gestor_id UUID NOT NULL REFERENCES monitor(id),
    status_auditoria TEXT NOT NULL CHECK (status_auditoria IN ('Aprovado', 'Recusado')),
    justificativa TEXT NOT NULL,
    data_hora_acao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Índices de Otimização e Performance (SC-005)
CREATE INDEX IF NOT EXISTS idx_solicitacao_cpf ON solicitacao_monitoria(cpf_aluno);
CREATE INDEX IF NOT EXISTS idx_solicitacao_monitor_status ON solicitacao_monitoria(monitor_responsavel_id, status);
CREATE INDEX IF NOT EXISTS idx_item_atividade_registro ON item_atividade(registro_semanal_id);
CREATE INDEX IF NOT EXISTS idx_historico_registro ON historico_auditoria(registro_semanal_id);
