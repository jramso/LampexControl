-- db/migrations/011_rename_monitor_to_usuario.sql

-- 1. Renomear a tabela monitor para usuario
ALTER TABLE monitor RENAME TO usuario;

-- 2. Renomear a restrição CHECK
ALTER TABLE usuario RENAME CONSTRAINT monitor_role_check TO usuario_role_check;

-- 3. Atualizar a função RPC de Autenticação (Login) para usar a tabela usuario
CREATE OR REPLACE FUNCTION login(email text, password text)
RETURNS text AS $$
DECLARE
    m_id UUID;
    m_role text;
    m_email text;
    jwt_secret text;
    payload jsonb;
    pwd_ok boolean;
BEGIN
    jwt_secret := current_setting('app.settings.jwt_secret', true);
    IF jwt_secret IS NULL OR jwt_secret = '' THEN
        jwt_secret := 'your_jwt_secret_here'; -- Segredo padrão correspondente ao .env
    END IF;

    SELECT id, role, usuario.email, (senha_hash = crypt(password, senha_hash))
    INTO m_id, m_role, m_email, pwd_ok
    FROM usuario
    WHERE usuario.email = login.email;

    IF pwd_ok THEN
        payload := jsonb_build_object(
            'role', m_role,
            'email', m_email,
            'id', m_id,
            'exp', extract(epoch from now() + interval '24 hours')::integer
        );
        RETURN sign_jwt(payload, jwt_secret);
    ELSE
        RAISE EXCEPTION 'invalid_credentials';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atualizar a view de agregação do Mapa de Calor
CREATE OR REPLACE VIEW view_heatmap_disponibilidade AS
WITH days AS (
    SELECT unnest(ARRAY['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira']) AS dia_semana
),
periods AS (
    SELECT unnest(ARRAY['Matutino', 'Vespertino', 'Noturno']) AS bloco_horario
)
SELECT 
    d.dia_semana,
    p.bloco_horario,
    COALESCE(SUM((u.matriz_disponibilidade->d.dia_semana->>p.bloco_horario)::numeric), 0) AS peso_total
FROM usuario u
CROSS JOIN days d
CROSS JOIN periods p
WHERE u.role IN ('voluntario', 'professor')
GROUP BY d.dia_semana, p.bloco_horario;

-- 5. Atualizar a view view_contato_monitor
CREATE OR REPLACE VIEW view_contato_monitor AS
SELECT 
    s.id AS chamado_id,
    s.cpf_aluno,
    u.id AS monitor_id,
    u.nome AS monitor_nome,
    CASE 
        WHEN s.status = 'Confirmado' AND u.permite_exibir_contato = TRUE THEN u.telefone
        ELSE NULL
    END AS monitor_telefone,
    CASE 
        WHEN s.status = 'Confirmado' AND u.permite_exibir_contato = TRUE THEN u.plataforma_contato
        ELSE NULL
    END AS monitor_plataforma
FROM solicitacao_monitoria s
JOIN usuario u ON s.monitor_responsavel_id = u.id;
