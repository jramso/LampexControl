-- db/migrations/002_triggers_and_rules.sql
-- Lógica de negócios, Triggers, JWT e Rate Limiting no PostgreSQL

-- 1. Cálculo Automatizado de Horas Líquidas
CREATE OR REPLACE FUNCTION calcular_horas_liquidas()
RETURNS TRIGGER AS $$
BEGIN
    CASE NEW.tipo_atividade
        WHEN 'Monitoria' THEN
            NEW.horas_liquidas := NEW.horas_brutas * 2.0;
        WHEN 'Minicurso com Material' THEN
            NEW.horas_liquidas := NEW.horas_brutas * 3.0;
        WHEN 'Minicurso sem Material' THEN
            NEW.horas_liquidas := NEW.horas_brutas * 2.5;
        WHEN 'Marketing Digital' THEN
            IF NEW.horas_brutas = 1.0 THEN
                NEW.horas_liquidas := 2.0; -- 2 horas por post (Story/Reel/Feed)
            ELSE
                NEW.horas_liquidas := 4.0; -- 4 horas para melhoria de perfil
            END IF;
        ELSE
            NEW.horas_liquidas := NEW.horas_brutas; -- Dev / Outros
    END CASE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_calcular_horas_liquidas
BEFORE INSERT OR UPDATE ON item_atividade
FOR EACH ROW
EXECUTE FUNCTION calcular_horas_liquidas();

-- 2. Trava de Reuniões Gerais de Planejamento (Horas líquidas = 0.0)
CREATE OR REPLACE FUNCTION aplicar_trava_reunioes()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo_atividade = 'Outros' AND NEW.evidencia_url ILIKE '%planejamento%' THEN
        NEW.horas_liquidas := 0.0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_trava_reunioes
BEFORE INSERT OR UPDATE ON item_atividade
FOR EACH ROW
EXECUTE FUNCTION aplicar_trava_reunioes();


-- 3. Utilidades para Criptografia e Geração de JWT
CREATE OR REPLACE FUNCTION urlsafe_b64encode(data bytea)
RETURNS text AS $$
DECLARE
    val text;
BEGIN
    val := encode(data, 'base64');
    val := replace(val, '+', '-');
    val := replace(val, '/', '_');
    val := replace(val, '=', '');
    val := replace(val, E'\n', '');
    RETURN val;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sign_jwt(payload jsonb, secret text)
RETURNS text AS $$
DECLARE
    header text;
    payload_text text;
    sign_input text;
    signature text;
BEGIN
    header := urlsafe_b64encode('{"alg":"HS256","typ":"JWT"}'::bytea);
    payload_text := urlsafe_b64encode(payload::text::bytea);
    sign_input := header || '.' || payload_text;
    signature := urlsafe_b64encode(hmac(sign_input::bytea, secret::bytea, 'sha256'));
    RETURN sign_input || '.' || signature;
END;
$$ LANGUAGE plpgsql;


-- 4. Função RPC de Autenticação (Login)
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

    SELECT id, role, monitor.email, (senha_hash = crypt(password, senha_hash))
    INTO m_id, m_role, m_email, pwd_ok
    FROM monitor
    WHERE monitor.email = login.email;

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


-- 5. Rate Limiting de IPs
CREATE TABLE IF NOT EXISTS rate_limit_log (
    ip_address TEXT NOT NULL,
    action_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION check_rate_limit(ip TEXT, action TEXT, max_req INTEGER, period INTERVAL)
RETURNS BOOLEAN AS $$
DECLARE
    req_count INTEGER;
BEGIN
    DELETE FROM rate_limit_log WHERE created_at < NOW() - period;

    SELECT count(*) INTO req_count
    FROM rate_limit_log
    WHERE ip_address = ip AND action_type = action AND created_at >= NOW() - period;

    IF req_count >= max_req THEN
        RAISE EXCEPTION 'rate_limit_exceeded' USING DETAIL = 'Max ' || max_req || ' requests per ' || period::text;
    END IF;

    INSERT INTO rate_limit_log (ip_address, action_type) VALUES (ip, action);
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Pre-request hook do PostgREST
CREATE OR REPLACE FUNCTION check_rate_limit_pre_request()
RETURNS void AS $$
DECLARE
    client_ip TEXT;
    request_path TEXT;
BEGIN
    client_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
    IF client_ip IS NULL THEN
        client_ip := '127.0.0.1';
    END IF;
    
    request_path := current_setting('request.path', true);

    IF request_path = '/rpc/login' THEN
        PERFORM check_rate_limit(client_ip, 'login', 5, interval '1 minute');
    ELSIF request_path = '/solicitacao_monitoria' THEN
        PERFORM check_rate_limit(client_ip, 'public_api', 60, interval '1 minute');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Função RPC de submissão unificada de relatório semanal (pai-filho)
CREATE OR REPLACE FUNCTION submit_weekly_report(semana_ref date, pdf_url text, atividades jsonb)
RETURNS uuid AS $$
DECLARE
    auth_monitor_id uuid;
    new_report_id uuid;
BEGIN
    auth_monitor_id := (current_setting('request.jwt.claims', true)::json->>'id')::uuid;
    IF auth_monitor_id IS NULL THEN
        RAISE EXCEPTION 'unauthorized';
    END IF;

    -- Inserir registro pai
    INSERT INTO registro_semanal (monitor_id, semana_referencia, arquivo_pdf_url)
    VALUES (auth_monitor_id, semana_ref, pdf_url)
    RETURNING id INTO new_report_id;

    -- Inserir registros filhos (itens de atividades)
    INSERT INTO item_atividade (registro_semanal_id, tipo_atividade, horas_brutas, evidencia_url)
    SELECT new_report_id, 
           (elem->>'tipo_atividade'), 
           (elem->>'horas_brutas')::numeric, 
           (elem->>'evidencia_url')
    FROM jsonb_array_elements(atividades) AS elem;

    RETURN new_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. View de Agregação do Mapa de Calor
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
    COALESCE(SUM((m.matriz_disponibilidade->d.dia_semana->>p.bloco_horario)::numeric), 0) AS peso_total
FROM monitor m
CROSS JOIN days d
CROSS JOIN periods p
WHERE m.role = 'monitor'
GROUP BY d.dia_semana, p.bloco_horario;


