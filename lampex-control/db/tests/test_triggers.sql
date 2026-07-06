-- db/tests/test_triggers.sql
-- Testes unitários para triggers de cálculo de peso e trava de reuniões

BEGIN;
SELECT plan(6);

-- 1. Testar se o cálculo de peso para 'Monitoria' é horas * 2
INSERT INTO registro_semanal (id, monitor_id, semana_referencia, arquivo_pdf_url)
VALUES ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '2026-07-06', 'http://example.com/relatorio.pdf');

INSERT INTO item_atividade (registro_semanal_id, tipo_atividade, horas_brutas, evidencia_url)
VALUES ('11111111-1111-1111-1111-111111111111', 'Monitoria', 4.0, 'http://evidence.com');

SELECT results_eq(
    $$ SELECT horas_liquidas FROM item_atividade WHERE tipo_atividade = 'Monitoria' $$,
    $$ VALUES (8.0) $$,
    'Cálculo de horas líquidas de monitoria deve ser bruto * 2'
);

-- 2. Testar se o cálculo para 'Minicurso com Material' é horas * 3
INSERT INTO item_atividade (registro_semanal_id, tipo_atividade, horas_brutas, evidencia_url)
VALUES ('11111111-1111-1111-1111-111111111111', 'Minicurso com Material', 2.0, 'http://evidence.com');

SELECT results_eq(
    $$ SELECT horas_liquidas FROM item_atividade WHERE tipo_atividade = 'Minicurso com Material' $$,
    $$ VALUES (6.0) $$,
    'Cálculo de horas de minicurso com material deve ser bruto * 3'
);

-- 3. Testar se o cálculo para 'Marketing Digital' (post comum) é 2.0 fixo
INSERT INTO item_atividade (registro_semanal_id, tipo_atividade, horas_brutas, evidencia_url)
VALUES ('11111111-1111-1111-1111-111111111111', 'Marketing Digital', 1.0, 'http://evidence.com');

SELECT results_eq(
    $$ SELECT horas_liquidas FROM item_atividade WHERE tipo_atividade = 'Marketing Digital' AND horas_brutas = 1.0 $$,
    $$ VALUES (2.0) $$,
    'Marketing digital (post comum) deve retornar 2.0 horas líquidas'
);

-- 4. Testar a trava de reuniões de planejamento geral (horas líquidas = 0.0)
INSERT INTO item_atividade (registro_semanal_id, tipo_atividade, horas_brutas, evidencia_url)
VALUES ('11111111-1111-1111-1111-111111111111', 'Outros', 2.0, 'http://evidence.com/planejamento-semanal');

SELECT results_eq(
    $$ SELECT horas_liquidas FROM item_atividade WHERE tipo_atividade = 'Outros' AND evidencia_url LIKE '%planejamento%' $$,
    $$ VALUES (0.0) $$,
    'Horas de reuniões de planejamento devem ser forçadas a 0.0'
);

SELECT * FROM finish();
ROLLBACK;
