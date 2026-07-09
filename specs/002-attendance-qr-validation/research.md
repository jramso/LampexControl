# Research Log: Validação de Atendimentos via QR Code

Este documento detalha as decisões técnicas, escolhas de design e alternativas consideradas para a implementação do fluxo de validação de atendimentos via QR Code.

## Decisões Técnicas

### 1. Modelagem da Tabela de Persistência `registro_atendimento`

- **Decisão**: Criar a tabela `registro_atendimento` no PostgreSQL com suporte a horas fracionadas e segurança referencial.
  ```sql
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
  ```
- **Racional**:
  - `monitor_id` é configurado com `ON DELETE SET NULL` para que, caso um monitor seja desligado/removido do sistema, os registros de atendimento dos alunos permaneçam íntegros para auditoria do consumo do laboratório.
  - `horas_duracao` utiliza `NUMERIC(4,2)` permitindo frações de horas (ex: 1.5 horas para 1h30min de monitoria).
  - `created_at` armazena o carimbo de data/hora do registro de atendimento, permitindo a filtragem precisa por datas.
- **Alternativas Consideradas**:
  - `ON DELETE CASCADE` para `monitor_id`: Rejeitada porque a remoção de um monitor causaria a perda histórica dos atendimentos de alunos, invalidando auditorias retroativas.
  - Armazenar duração em minutos como `INTEGER`: Rejeitada porque a unidade de negócio padrão no LAMPEX é horas (tipo NUMERIC nos outros modelos).

### 2. Mecanismo de Agregação de Horas na API

- **Decisão**: Implementar a agregação estatística diretamente nas queries SQL dos novos endpoints protegidos da API:
  - Para Monitores: `SUM(horas_duracao * 2)` aglutinado por monitor.
  - Para Alunos: `SUM(horas_duracao)` aglutinado por matrícula e nome do aluno.
- **Racional**:
  - Garante que a regra de planejamento (fator multiplicador x2) seja aplicada de forma segura no lado do servidor, impedindo manipulações pelo cliente e reduzindo o consumo de banda de rede.
  - Centraliza a lógica de negócio na camada de persistência e de serviço da API.
- **Alternativas Consideradas**:
  - Enviar dados brutos e calcular o multiplicador no frontend: Rejeitada para evitar vazamento de regras de negócios confidenciais e evitar discrepâncias em diferentes visualizações.

### 3. dropdown de Monitores Ativos no Formulário Público

- **Decisão**: Utilizar o endpoint `/api/monitor` (já existente no backend) para carregar dinamicamente os monitores no dropdown `<select>` de `MonitoriaRapida.vue`.
- **Racional**:
  - Evita a criação desnecessária de um novo endpoint público, reutilizando a rota de consulta de monitores do sistema que já possui suporte a filtros e paginação.
- **Alternativas Consideradas**:
  - Hardcodear os monitores no frontend: Rejeitada por exigir novos deploys a cada mudança de monitores no time.
