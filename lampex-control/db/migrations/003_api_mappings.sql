-- db/migrations/003_api_mappings.sql
-- Mapeamentos e Aliases para compatibilidade de rotas do cliente PostgREST

-- 1. View solicitacoes_monitoria (auto-updatable pelo PostgreSQL)
CREATE OR REPLACE VIEW solicitacoes_monitoria AS 
SELECT * FROM solicitacao_monitoria;

-- 2. View view_reuniao_geral (alias para view_heatmap_disponibilidade)
CREATE OR REPLACE VIEW view_reuniao_geral AS 
SELECT * FROM view_heatmap_disponibilidade;

-- 3. View view_contato_monitor (com lógica de status e privacidade integrada de forma segura)
CREATE OR REPLACE VIEW view_contato_monitor AS
SELECT 
    s.id AS chamado_id,
    s.cpf_aluno,
    m.id AS monitor_id,
    m.nome AS monitor_nome,
    CASE 
        WHEN s.status = 'Confirmado' AND m.permite_exibir_contato = TRUE THEN m.telefone
        ELSE NULL
    END AS monitor_telefone,
    CASE 
        WHEN s.status = 'Confirmado' AND m.permite_exibir_contato = TRUE THEN m.plataforma_contato
        ELSE NULL
    END AS monitor_plataforma
FROM solicitacao_monitoria s
JOIN monitor m ON s.monitor_responsavel_id = m.id;

-- 4. Função RPC registro_horas (redireciona para submit_weekly_report)
CREATE OR REPLACE FUNCTION registro_horas(semana_ref date, pdf_url text, atividades jsonb)
RETURNS uuid AS $$
BEGIN
    RETURN submit_weekly_report(semana_ref, pdf_url, atividades);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
