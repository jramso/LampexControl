# Feature Specification: Validação de Atendimentos via QR Code

**Feature Branch**: `002-attendance-qr-validation`

**Created**: 2026-07-08

**Status**: Completed

**Input**: User description: "OBJETIVO DO SPRINT: Extinguir a validação física (papel/assinatura) do laboratório, substituindo-a por um fluxo assíncrono Web-Driven iniciado via QR Code pelo aluno atendido, integrando agregação estatística com fator de planejamento x2 na camada de persistência.

ESCOPO DE EXECUÇÃO DIVIDIDO EM 2 CAMADAS:

1. SUBPROJETO BACKEND (/lampex-control-api):
   - Criar a tabela 'registro_atendimento' vinculada a 'monitor(id)' com colunas para matricula do aluno, nome, modalidade (Presencial/Online), local_ou_link e horas_duracao (tipo NUMERIC).
   - Desenvolver o endpoint público 'POST /api/atendimentos/registrar' para inserção direta dos dados gerados pelo QR Code.
   - Desenvolver o endpoint protegido 'GET /api/relatorios/monitores' aplicando a agregação 'SUM(horas_duracao * 2)' agrupada por ID do monitor para embutir o tempo de planejamento regulamentar.
   - Desenvolver o endpoint protegido 'GET /api/relatorios/alunos' aplicando 'SUM(horas_duracao)' sem multiplicadores para auditar o consumo real da comunidade acadêmica.

2. SUBPROJETO FRONTEND (/lampex-control):
   - Desenvolver a view pública e responsiva (Mobile-First) 'MonitoriaRapida.vue' mapeada na rota '/atendimento-rapido'. Ela deve consumir a lista de monitores ativos da API para preencher um componente <select> e disparar o formulário de validação.
   - Atualizar o 'ManagerDashboard.vue' inserindo a aba 'Relatórios', contendo filtros de data (Initial/Final Date) e duas tabelas HTML independentes com a paleta institucional verde (#008744) para renderizar os dados de produtividade dos monitores e de consumo dos alunos atendidos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registro de Atendimento pelo Aluno via QR Code (Priority: P1)

Como um aluno que acabou de receber atendimento em uma monitoria ou laboratório, eu quero escanear um QR Code que me direciona para uma página pública e preencher um formulário simples no meu celular para que eu registre a realização do meu atendimento de forma digital e sem necessidade de assinar papel.

**Why this priority**: Crítico/P1. É a principal funcionalidade para extinguir a validação física. Sem o formulário público, o fluxo de coleta de dados de atendimento deixa de existir.

**Independent Test**: O aluno acessa a rota `/atendimento-rapido` no frontend (idealmente direcionado via QR Code no celular), visualiza a lista de monitores ativos obtida da API, seleciona o monitor que o atendeu, preenche seus dados (matrícula, nome, modalidade, local/link e duração em horas), clica em submeter e recebe uma mensagem de sucesso indicando que o atendimento foi registrado. O registro deve constar no banco de dados na tabela `registro_atendimento`.

**Acceptance Scenarios**:

1. **Given** que o aluno está no formulário de atendimento rápido, **When** ele seleciona o monitor, insere sua matrícula, nome completo, modalidade "Presencial", insere o local físico e as horas de duração, **Then** a requisição pública para a API é realizada com sucesso e uma confirmação visual é exibida.
2. **Given** que a modalidade selecionada seja "Online", **When** o aluno preenche os campos obrigatórios (sem necessidade de fornecer local ou link), **Then** o campo de local/link não é exibido, o valor é preenchido internamente como "Online", e a requisição pública é submetida com sucesso.
3. **Given** que o aluno preenche os campos com tipos de dados incorretos (ex: horas_duracao menor ou igual a zero, ou matrícula contendo caracteres especiais inválidos), **When** ele tenta enviar, **Then** o frontend bloqueia a submissão e sinaliza o erro.

---

### User Story 2 - Visualização de Relatórios de Monitoria e Produtividade (Priority: P1)

Como gestor do laboratório (coordenação), eu quero acessar uma aba de "Relatórios" no painel de administração, filtrar por datas de início e fim, e visualizar a produtividade agregada dos monitores com fator de planejamento x2, além do consumo real de horas pelos alunos.

**Why this priority**: Crítico/P1. Essencial para controle administrativo, prestação de contas de horas de monitoria e planejamento das atividades do laboratório.

**Independent Test**: O gestor faz login, acessa o painel de coordenação (`ManagerDashboard.vue`), clica na aba "Relatórios", escolhe um intervalo de datas e visualiza duas tabelas independentes populadas com dados agregados das APIs de relatórios com layout estilizado em verde institucional `#008744`.

**Acceptance Scenarios**:

1. **Given** que o gestor está na aba "Relatórios" do painel de administração, **When** ele define as datas inicial e final, **Then** as tabelas exibem a lista de monitores com o total de horas calculadas com o multiplicador de planejamento (2x) e a lista de consumo dos alunos contendo a matrícula, nome e horas totais sem multiplicadores.
2. **Given** que as datas inicial e final são inválidas (ex: data inicial maior que a data final), **When** o gestor tenta filtrar, **Then** a interface avisa o usuário do erro e não dispara requisições com filtros inconsistentes.
3. **Given** que o gestor acessa a aba sem fornecer filtros de datas, **When** o painel é carregado, **Then** o sistema assume um intervalo de data padrão (ex: últimos 30 dias ou mês atual) para carregar os relatórios iniciais sem erro.

---

### Edge Cases

- **Remoção de Monitor Associado**: O que acontece com os registros de atendimento se um monitor associado for deletado do sistema?
  - *Comportamento esperado*: A coluna `monitor_id` na tabela `registro_atendimento` deve possuir a constraint `ON DELETE SET NULL`, de forma que o histórico de atendimentos e horas consumidas pelos alunos não seja perdido para fins de auditoria, mesmo que o monitor seja descadastrado.
- **Inserção de Horas Fracionadas**: O que acontece se o atendimento durar 1 hora e meia (1.5 horas)?
  - *Comportamento esperado*: A coluna `horas_duracao` é do tipo `NUMERIC`, permitindo que horas fracionadas (como `1.5` ou `2.25`) sejam registradas e somadas corretamente em formato de ponto flutuante na API e banco de dados.
- **Requisições de Relatórios Sem Token JWT ou Token Expirado**: O que acontece se um aluno ou usuário externo tentar acessar os endpoints de relatórios da coordenação?
  - *Comportamento esperado*: As rotas `/api/relatorios/monitores` e `/api/relatorios/alunos` exigem cabeçalho `Authorization` Bearer Token com a role de `'gestor'`. Qualquer requisição sem token ou com token inválido/expirado recebe HTTP 401 (Unauthorized) ou HTTP 403 (Forbidden).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O subprojeto `/lampex-control-api` deve possuir a tabela `registro_atendimento` no PostgreSQL com as colunas: `id` UUID PRIMARY KEY, `monitor_id` UUID referenciando `monitor(id)` com `ON DELETE SET NULL`, `matricula` TEXT, `nome` TEXT, `modalidade` TEXT (CHECK IN ('Presencial', 'Online')), `local_ou_link` TEXT, `horas_duracao` NUMERIC e `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW().
- **FR-002**: O endpoint `POST /api/atendimentos/registrar` deve ser público, receber os dados de registro de atendimento, validar a obrigatoriedade dos campos e inseri-los no banco.
- **FR-003**: O endpoint `GET /api/relatorios/monitores` deve exigir autenticação via JWT com a role de `'gestor'`, receber filtros de data (`start_date` e `end_date`), e retornar a soma das horas dos atendimentos multiplicadas pelo fator regulamentar de planejamento (`SUM(horas_duracao * 2)`), agrupada por ID e nome do monitor.
- **FR-004**: O endpoint `GET /api/relatorios/alunos` deve exigir autenticação via JWT com a role de `'gestor'`, receber filtros de data (`start_date` e `end_date`), e retornar a soma real das horas consumidas (`SUM(horas_duracao)`), agrupada por matrícula e nome do aluno.
- **FR-005**: O frontend `/lampex-control` deve disponibilizar a rota pública `/atendimento-rapido` apontando para o componente visual `MonitoriaRapida.vue`.
- **FR-006**: O formulário em `MonitoriaRapida.vue` deve carregar dinamicamente a lista de monitores através da API para preencher a seleção (`<select>`) de monitores ativos, garantindo que o aluno possa escolher quem realizou o atendimento.
- **FR-007**: O formulário do aluno deve implementar design responsivo (Mobile-First) e validar que a matrícula seja alfanumérica (letras e números) e que horas_duracao seja maior que zero.
- **FR-008**: O painel `ManagerDashboard.vue` deve ser atualizado para incluir a aba "Relatórios" com filtros reativos para data de início e data de término.
- **FR-009**: A aba "Relatórios" deve renderizar duas tabelas HTML independentes com layout estilizado utilizando a cor institucional verde (#008744) para os cabeçalhos das tabelas ou elementos de destaque.
- **FR-010**: A API backend deve responder com cabeçalhos de CORS corretos em todas as respostas públicas e autenticadas para permitir o consumo seguro a partir de origens externas.

### Key Entities *(include if feature involves data)*

- **Registro de Atendimento (Tabela `registro_atendimento`)**:
  - `id`: UUID (Chave primária)
  - `monitor_id`: UUID referenciando a tabela `monitor` (Chave estrangeira)
  - `matricula`: TEXT representando a matrícula do aluno atendido (Não nulo)
  - `nome`: TEXT representando o nome do aluno atendido (Não nulo)
  - `modalidade`: TEXT restrito a ('Presencial', 'Online') (Não nulo)
  - `local_ou_link`: TEXT contendo o laboratório/sala física ou a URL da reunião virtual (Não nulo)
  - `horas_duracao`: NUMERIC representando a duração em horas do atendimento (Não nulo)
  - `created_at`: TIMESTAMP WITH TIME ZONE representando o momento em que o atendimento foi validado (Não nulo, padrão NOW())

- **Monitor (Tabela `monitor`)**:
  - Tabela pré-existente no banco de dados. Os registros de atendimento farão referência ao `id` do monitor nesta tabela.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O aluno atendido consegue concluir o preenchimento e submissão do formulário de atendimento rápido via celular em menos de 1 minuto.
- **SC-002**: O cálculo e a agregação das horas dos monitores na API aplicam corretamente o fator de multiplicação de planejamento (horas totais = horas reais * 2).
- **SC-003**: O relatório de consumo de alunos reflete estritamente as horas brutas reais registradas, sem qualquer multiplicador de planejamento.
- **SC-004**: O gestor do laboratório consegue visualizar as informações filtradas na aba de relatórios em menos de 1 segundo de tempo de resposta.
- **SC-005**: 100% das tentativas de leitura dos relatórios sem token de gestor válido são bloqueadas com erro de autenticação (HTTP 401 ou 403).

## Assumptions

- **A-001**: O intervalo de datas de filtragem padrão na aba "Relatórios", caso não informado, corresponderá ao intervalo compreendido entre o primeiro e o último dia do mês corrente.
- **A-002**: A lista de monitores a ser exibida no dropdown `<select>` de `MonitoriaRapida.vue` pode ser consultada a partir do endpoint público de monitores existente ou adaptado de forma a retornar apenas o ID e nome dos monitores ativos, minimizando exposição de dados privados.
- **A-003**: Os links e locais de atendimento inseridos pelos alunos não contêm formatação especial rígida na camada de banco de dados, sendo validados apenas como campos de texto não vazios.
- **A-004**: A validação das datas no dashboard frontend impede requisições para a API se a data final for anterior à data inicial.
