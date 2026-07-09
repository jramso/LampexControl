-- db/migrations/013_extension_governance.sql
-- 1. Criar a tabela acao_extensao
CREATE TABLE IF NOT EXISTS acao_extensao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_acao TEXT NOT NULL,
    descricao TEXT,
    codigo_src TEXT NOT NULL UNIQUE,
    status_acao TEXT NOT NULL DEFAULT 'Ativa' CHECK (status_acao IN ('Ativa', 'Inativa')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inserir a ação de extensão padrão para migrar registros antigos
INSERT INTO acao_extensao (nome_acao, codigo_src, descricao)
VALUES ('Ação de Extensão Padrão', 'PADRAO', 'Ação criada automaticamente para migração de histórico')
ON CONFLICT (codigo_src) DO NOTHING;

-- 3. Adicionar coluna acao_id na tabela usuario (antiga monitor)
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS acao_id UUID REFERENCES acao_extensao(id) ON DELETE SET NULL;

-- 4. Associar voluntários e professores existentes à ação padrão se estiver nulo
UPDATE usuario 
SET acao_id = (SELECT id FROM acao_extensao WHERE codigo_src = 'PADRAO') 
WHERE acao_id IS NULL AND role IN ('voluntario', 'professor');

-- 5. Adicionar a coluna acao_id na tabela registro_atendimento (temporariamente aceitando NULL)
ALTER TABLE registro_atendimento ADD COLUMN IF NOT EXISTS acao_id UUID REFERENCES acao_extensao(id) ON DELETE RESTRICT;

-- 6. Atualizar registros antigos de registro_atendimento para apontar para a ação padrão
UPDATE registro_atendimento 
SET acao_id = (SELECT id FROM acao_extensao WHERE codigo_src = 'PADRAO') 
WHERE acao_id IS NULL;

-- 7. Definir acao_id como NOT NULL na tabela registro_atendimento
ALTER TABLE registro_atendimento ALTER COLUMN acao_id SET NOT NULL;

-- 8. Adicionar as colunas adicionais para monitoria com professor em registro_atendimento
ALTER TABLE registro_atendimento ADD COLUMN IF NOT EXISTS senha_sessao TEXT;
ALTER TABLE registro_atendimento ADD COLUMN IF NOT EXISTS professor_id UUID REFERENCES usuario(id) ON DELETE SET NULL;

-- 9. Criar índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_usuario_acao_id ON usuario(acao_id);
CREATE INDEX IF NOT EXISTS idx_registro_atendimento_acao_id ON registro_atendimento(acao_id);
CREATE INDEX IF NOT EXISTS idx_registro_atendimento_professor_id ON registro_atendimento(professor_id);
