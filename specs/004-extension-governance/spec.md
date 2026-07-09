# Feature Specification: Plataforma de Governança de Ações de Extensão

**Feature Branch**: `004-extension-governance`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User description: "Expandir o escopo lógico do ecossistema LampexControl de um validador de monitorias genéricas para uma plataforma de governança unificada de Ações de Extensão com controle de integridade via código de matrícula. MANTENHA INTACTO: A tabela 'usuário' como a entidade central de usuários e credenciais, bem como seu fluxo de login atual. Antes de reestruturar analise o que já esta atendido das funções abaixo e foque em manter a estrutura funcionando. REESTRUTURAÇÃO DA CAMADA DE DADOS (/lampex-control-api): 1. Gerar e rodar uma migração SQL na Aiven para atualizar a restrição CHECK da coluna 'role' na tabela 'monitor' para suportar exatamente os novos papéis: ('voluntario', 'professor', 'gestor_fixo', 'gestor_temporario'). 2. Criar a tabela 'acao_extensao' com colunas: id (UUID), nome_acao (TEXT), descricao (TEXT), codigo_src (TEXT, UNIQUE), status_acao (TEXT, default 'Ativa') e created_at. 3. Modificar a tabela 'registro_atendimento' incluindo uma chave estrangeira obrigatória 'acao_id REFERENCES acao_extensao(id) ON DELETE RESTRICT'. Adicionar também as colunas 'senha_sessao' (TEXT) e 'professor_id' (UUID, estrangeira). OTIMIZAÇÃO DO FLUXO DE ATENDIMENTO (ENDPOINTS): 1. Atualizar o 'POST /api/atendimentos/registrar': - Modificar a validação para que, ao receber o campo 'codigo_monitor', o Worker busque o voluntário correspondente pelo ID selecionado e valide se os últimos 4 caracteres da matrícula dele no banco batem perfeitamente com o código digitado. - Caso a modalidade enviada seja 'Presencial com Professor', forçar a verificação obrigatória se a senha digitada pelo aluno confere com a 'senha_sessao' ativa do dia para aquele atendimento. INTERFACE REATIVA E RESPONSIVA (/lampex-control): 1. Refatorar o componente 'MonitoriaRapida.vue' (Mobile-First): - Adicionar um seletor dinâmico (<select>) que consome as ações de extensão ativas da API. O seletor de voluntários deve filtrar e exibir apenas membros atrelados àquela ação específica. - Incluir o campo obrigatório de input numérico para os 4 últimos dígitos da matrícula do voluntário. - Utilizar um v-if condicional para exibir o campo de 'Senha da Aula' se a modalidade selecionada for 'Presencial com Professor'. 2. Atualizar o 'ManagerDashboard.vue': - Modificar o painel de relatórios ('ReportsPanel.vue') e auditoria para listar as métricas agrupadas por Ação de Extensão, mantendo o cálculo de horas brutas para alunos e o multiplicador por 2 (fator de planejamento) para os voluntários. - Adicionar uma ferramenta para que os gestores fixos (Bruno/Emanuel) promovam ou rebaixem voluntários para a role de 'gestor_temporario' usando um botão de toggle simples."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seleção Dinâmica de Ações de Extensão e Filtragem de Voluntários (Priority: P1)

Como um estudante acessando o formulário de atendimento rápido, eu quero selecionar a Ação de Extensão correspondente e visualizar apenas os voluntários atrelados a ela, para registrar o atendimento de forma correta e sem inconsistências.

**Why this priority**: Crítico/P1. Essencial para a governança das ações de extensão e evita erros de lançamento de atendimentos associando-os à ação errada.

**Independent Test**: O estudante abre a página de monitoria rápida, visualiza o seletor dinâmico de Ações de Extensão, seleciona uma ação específica e verifica que o campo de seleção de voluntário lista apenas os membros vinculados a essa ação de extensão.

**Acceptance Scenarios**:

1. **Given** que o estudante está no formulário de atendimento rápido, **When** ele seleciona uma Ação de Extensão do select dinâmico, **Then** a lista de voluntários é imediatamente filtrada e exibe apenas os voluntários vinculados àquela ação específica.
2. **Given** que o estudante está no formulário e nenhuma Ação de Extensão foi selecionada, **Then** o campo de seleção de voluntários deve permanecer desabilitado ou vazio até que uma ação seja escolhida.

---

### User Story 2 - Validação de Integridade por Matrícula do Voluntário (Priority: P1)

Como um estudante inserindo um registro de atendimento, eu quero digitar os 4 últimos dígitos da matrícula do voluntário para certificar a autenticidade do atendimento presencial ou online realizado.

**Why this priority**: Crítico/P1. Garante que os registros correspondam a interações reais e legítimas com os voluntários e evita abusos de lançamento.

**Independent Test**: O estudante preenche seus dados, seleciona o voluntário, digita os 4 últimos dígitos de matrícula dele e submete. O sistema valida se os caracteres digitados coincidem com a matrícula cadastrada no banco de dados para o voluntário selecionado.

**Acceptance Scenarios**:

1. **Given** que o estudante selecionou um voluntário e inseriu os 4 últimos caracteres corretos da matrícula desse voluntário, **When** ele submete o formulário, **Then** o backend registra o atendimento e retorna sucesso.
2. **Given** que o estudante insere um código incorreto ou incompleto, **When** ele submete o formulário, **Then** o backend rejeita o registro com uma mensagem de erro indicando código inválido.

---

### User Story 3 - Validação de Presença com Senha do Dia (Priority: P1)

Como um estudante participando de uma monitoria na modalidade "Presencial com Professor", eu quero digitar a senha de aula compartilhada no dia pelo professor para que minha presença seja computada com segurança.

**Why this priority**: Crítico/P1. Garante a integridade e veracidade da presença do aluno nas aulas coordenadas por professores.

**Independent Test**: O estudante seleciona a modalidade "Presencial com Professor" no formulário. O campo para "Senha da Aula" é exibido. O estudante insere a senha correta e envia. O backend confirma a senha contra a sessão ativa do dia para aquele professor e registra.

**Acceptance Scenarios**:

1. **Given** que a modalidade selecionada é "Presencial com Professor", **When** o estudante insere a senha correspondente à sessão ativa do professor na data atual, **Then** a presença é confirmada e registrada com sucesso.
2. **Given** que o estudante insere uma senha incorreta ou correspondente a uma sessão de outro dia, **When** ele tenta submeter, **Then** o sistema recusa o envio com mensagem de erro apropriada.

---

### User Story 4 - Relatórios Consolidados por Ação de Extensão (Priority: P2)

Como um gestor do LAMPEX, eu quero visualizar no painel de relatórios as métricas de atendimento agrupadas por Ação de Extensão, computando as horas brutas para alunos e o multiplicador por 2 para voluntários, de modo a gerar estatísticas corretas para a governança.

**Why this priority**: Média/P2. Permite a avaliação de desempenho e a prestação de contas das ações de extensão individuais.

**Independent Test**: O gestor acessa a aba de relatórios administrativos e verifica que as tabelas de métricas e horas estão agrupadas por Ação de Extensão, aplicando o multiplicador corretivo de planejamento (fator x2) para os voluntários.

**Acceptance Scenarios**:

1. **Given** que o gestor acessa o painel de relatórios, **When** os dados de auditoria e atendimento são processados, **Then** o painel exibe a soma de horas brutas dos alunos atendidos e o dobro da soma de horas dos voluntários, organizados por projeto/ação de extensão.

---

### User Story 5 - Promoção e Rebaixamento de Bolsistas (Priority: P2)

Como um gestor fixo, eu quero promover ou rebaixar voluntários para a role de 'gestor_temporario' usando um botão de toggle simples no painel administrativo.

**Why this priority**: Média/P2. Facilita o controle operacional de acessos e delegação de tarefas na equipe executora.

**Independent Test**: O gestor fixo localiza um voluntário no painel administrativo e clica no toggle de promoção. O papel do usuário é alterado no banco e seu acesso é atualizado correspondentemente.

**Acceptance Scenarios**:

1. **Given** que o gestor fixo visualiza a lista de voluntários, **When** ele clica no botão de toggle para promover um voluntário, **Then** a role dele muda para `gestor_temporario` no banco de dados.
2. **Given** que o gestor clica no toggle de um gestor temporário para revogar o cargo, **Then** a role dele muda para `voluntario` no banco de dados.

### Edge Cases

- **Ausência de Ação de Extensão**: O que acontece se a API não retornar nenhuma ação de extensão ativa?
  - *Comportamento esperado*: O formulário de Monitoria Rápida deve desabilitar os campos de seleção e alertar o usuário para entrar em contato com os administradores.
- **Voluntário cadastrado sem Matrícula**: Como o sistema lida se a matrícula de um voluntário selecionado estiver em branco no banco de dados?
  - *Comportamento esperado*: O backend deve retornar erro impedindo o registro e solicitando que o voluntário atualize seu perfil de cadastro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tabela de usuários (`usuario`, antiga `monitor`) deve manter a restrição CHECK na coluna `role` suportando exatamente: `'voluntario'`, `'professor'`, `'gestor_fixo'`, `'gestor_temporario'`. (Nota: Esta restrição já está atendida no banco de dados).
- **FR-002**: Deve ser criada a tabela `acao_extensao` no banco de dados para representar as ações de extensão cadastradas. A tabela deve conter as colunas:
  - `id`: UUID (Chave primária, default `gen_random_uuid()`)
  - `nome_acao`: TEXT (Não nulo)
  - `descricao`: TEXT
  - `codigo_src`: TEXT (Único, não nulo)
  - `status_acao`: TEXT (Padrão `'Ativa'`)
  - `created_at`: TIMESTAMP WITH TIME ZONE (Padrão `NOW()`)
- **FR-003**: A tabela `registro_atendimento` deve incluir uma chave estrangeira obrigatória `acao_id` referenciando `acao_extensao(id)` com comportamento `ON DELETE RESTRICT`. (Para registros históricos órfãos, deve-se criar uma ação padrão).
- **FR-004**: A tabela `registro_atendimento` deve incluir as colunas `senha_sessao` (TEXT) e `professor_id` (UUID, estrangeira referenciando `usuario(id)`).
- **FR-005**: O endpoint `POST /api/atendimentos/registrar` deve receber a propriedade `codigo_monitor` e compará-la com os 4 últimos dígitos da matrícula do voluntário selecionado no banco de dados (`usuario.matricula`). O registro deve falhar se os valores não coincidirem.
- **FR-006**: Se a modalidade informada for `'Presencial com Professor'`, o endpoint `POST /api/atendimentos/registrar` deve validar se a senha fornecida pelo estudante corresponde à `senha_sessao` ativa criada pelo professor para aquela data.
- **FR-007**: No subprojeto `/lampex-control`, o componente `MonitoriaRapida.vue` deve carregar as ações de extensão ativas via API e disponibilizá-las em um seletor `<select>`.
- **FR-008**: O seletor de voluntários em `MonitoriaRapida.vue` deve reativamente filtrar a lista de usuários exibindo apenas aqueles que pertencem à Ação de Extensão selecionada.
- **FR-009**: O componente `MonitoriaRapida.vue` deve exigir como campo obrigatório o preenchimento de um input numérico correspondente aos 4 últimos dígitos da matrícula do voluntário.
- **FR-010**: O componente `MonitoriaRapida.vue` deve apresentar um campo extra de senha via `v-if` apenas quando a modalidade selecionada for `'Presencial com Professor'`.
- **FR-011**: O painel administrativo `ManagerDashboard.vue` deve agrupar as métricas do painel de relatórios (`ReportsPanel.vue`) e auditoria por Ação de Extensão.
- **FR-012**: No painel de relatórios, o cálculo deve manter as horas brutas para alunos atendidos e multiplicar as horas por 2 (fator de planejamento) para os voluntários.
- **FR-013**: A tabela de gerenciamento de equipe em `ManagerDashboard.vue` deve permitir que gestores fixos alternem a role de um voluntário entre `'voluntario'` e `'gestor_temporario'` usando um controle de toggle simples que consome a API.

### Key Entities *(include if feature involves data)*

- **Ação de Extensão (`acao_extensao`)**:
  - `id`: UUID (Chave primária)
  - `nome_acao`: TEXT (Nome da ação)
  - `descricao`: TEXT (Descrição opcional)
  - `codigo_src`: TEXT (Código único, e.g. "BOLSISTAS_2026")
  - `status_acao`: TEXT (Padrão `'Ativa'`)

- **Usuário (`usuario`)**:
  - `id`: UUID (Chave primária)
  - `role`: TEXT (`'voluntario'`, `'professor'`, `'gestor_fixo'`, `'gestor_temporario'`)
  - `acao_id`: UUID (Chave estrangeira referenciando `acao_extensao(id)`)

- **Registro de Atendimento (`registro_atendimento`)**:
  - `id`: UUID (Chave primária)
  - `monitor_id`: UUID (Ref `usuario(id)`)
  - `acao_id`: UUID (Ref `acao_extensao(id)`, obrigatória)
  - `senha_sessao`: TEXT
  - `professor_id`: UUID (Ref `usuario(id)`)
  - `modalidade`: TEXT (`'Presencial'`, `'Online'`, `'Presencial com Professor'`)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O estudante consegue completar o preenchimento do formulário de Monitoria Rápida com código de matrícula e senha da aula em menos de 1 minuto.
- **SC-002**: 100% dos relatórios gerados por gestores exibem as horas consolidadas por Ação de Extensão aplicando corretamente o fator multiplicador para voluntários.
- **SC-003**: 100% dos registros de monitoria na modalidade "Presencial com Professor" têm sua senha validada contra a sessão ativa do dia antes da inserção no banco de dados.

## Assumptions

- Cada voluntário e professor está atrelado a uma Ação de Extensão específica no banco de dados através da coluna `acao_id` na tabela `usuario`.
- Para a migração do banco, registros antigos de atendimentos serão associados a uma "Ação de Extensão Padrão" criada automaticamente para garantir a integridade da chave estrangeira obrigatória.
- As sessões de aula ativas dos professores são gerenciadas por dia, expirando automaticamente à meia-noite do dia corrente de acordo com o fuso horário local.
