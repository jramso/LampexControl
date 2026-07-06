# Tasks: LampexControl System

**Input**: Design documents from `/specs/001-lampex-control-system/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/openapi.json, quickstart.md

**Tests**: Tests are included to validate correctness of calculations and security restrictions. Tests will be written using pgTAP for database triggers and Vitest for frontend flows.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização da estrutura física do projeto e dependências básicas.

- [X] T001 Criar estrutura de diretórios para migrações em db/migrations/
- [X] T002 Configurar dependências e scripts de automação no package.json
- [X] T003 Configurar variáveis de ambiente e arquivo de exemplo no .env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estrutura de dados, barramento de API PostgREST e configurações estruturais que bloqueiam o desenvolvimento das histórias.

- [X] T004 Criar script de migração inicial de tabelas em db/migrations/001_init_schema.sql
- [X] T005 Criar script de triggers de cálculo de peso e trava de reuniões em db/migrations/002_triggers_and_rules.sql
- [X] T006 [P] Configurar cliente de API PostgREST em src/services/apiClient.ts
- [X] T007 [P] Executar CLI openapi-typescript para gerar tipos em src/services/schema.ts
- [X] T008 [P] Configurar sistema de design global e tokens CSS em src/assets/index.css
- [X] T009 [P] Implementar rotas e guards de autenticação do Vue Router em src/router/index.ts
- [X] T010 Implementar função de login com JWT (RPC) em db/migrations/002_triggers_and_rules.sql
- [X] T011 Configurar políticas de rate limiting (limite de requisições por IP) nas rotas públicas e de login em db/migrations/002_triggers_and_rules.sql

**Checkpoint**: Infraestrutura de banco e conexão PostgREST ativas e 100% tipadas.

---

## Phase 3: User Story 1 - Solicitação e Agendamento de Monitorias (Priority: P1) 🎯 MVP

**Goal**: Permitir que alunos criem solicitações de monitoria públicas e acessem os dados de contato do monitor apenas após a confirmação.

**Independent Test**: Submeter o formulário de monitoria, confirmar que o ticket foi inserido como 'Pendente' e validar que as informações de contato do monitor são reveladas apenas se o agendamento estiver 'Confirmado'.

### Tests for User Story 1
- [X] T012 [P] [US1] Criar testes de integração para o fluxo de solicitação e privacidade em tests/integration/us1_tutoring_request.test.ts

### Implementation for User Story 1
- [X] T013 [P] [US1] Criar componente do formulário de solicitação de monitoria em src/components/TutoringRequestForm.vue
- [X] T014 [P] [US1] Criar tela de consulta de status de ticket do aluno em src/pages/RequestStatus.vue
- [X] T015 [US1] Integrar envio do formulário de monitoria ao PostgREST em src/pages/Home.vue
- [X] T016 [US1] Implementar lógica de exibição condicional de contato (WhatsApp/perfil) baseada no status e privacidade do monitor em src/pages/RequestStatus.vue

**Checkpoint**: Fluxo de chamados do aluno ativo e integrado ao banco de dados com segurança de dados de contato.

---

## Phase 4: User Story 2 - Registro de Disponibilidade e Submissão Semanal (Priority: P1) 🎯 MVP

**Goal**: Permitir que monitores preencham disponibilidade, configurem privacidade de contato e enviem relatórios de horas contendo múltiplos itens.

**Independent Test**: Preencher a matriz com pesos no perfil, ativar a privacidade, enviar múltiplos itens de atividades na semana de referência com PDF e checar se as horas líquidas foram salvas com os multiplicadores corretos.

### Tests for User Story 2
- [X] T017 [P] [US2] Criar testes unitários para a trigger de pesos e trava de reuniões em db/tests/test_triggers.sql
- [X] T018 [P] [US2] Criar testes de integração para submissão de atividades em tests/integration/us2_monitor_reporting.test.ts

### Implementation for User Story 2
- [X] T019 [P] [US2] Criar componente de matriz visual de disponibilidade em src/components/AvailabilityMatrix.vue
- [X] T020 [P] [US2] Criar componente de formulário de registro semanal em src/components/WeeklyReportForm.vue
- [X] T021 [US2] Implementar tela de configuração de perfil e privacidade em src/pages/MonitorProfile.vue
- [X] T022 [US2] Implementar tela de envio consolidado de relatório semanal em src/pages/WeeklySubmission.vue
- [X] T023 [US2] Criar função RPC submit_weekly_report para transação pai-filho no banco em db/migrations/002_triggers_and_rules.sql

**Checkpoint**: Monitores conseguem configurar seu perfil e enviar relatórios semanais com cálculo automático de horas.

---

## Phase 5: User Story 3 - Painel de Gestão (Priority: P2)

**Goal**: Permitir que gestores auditem relatórios em lote, vejam mapa de calor de disponibilidade e exportem para o SRC.

**Independent Test**: Aprovar/rejeitar relatórios de horas no painel, visualizar a distribuição de cores no mapa de calor geral e baixar arquivo formatado para o SRC.

### Tests for User Story 3
- [X] T024 [P] [US3] Criar testes de integração para auditoria e mapa de calor em tests/integration/us3_manager_audit.test.ts

### Implementation for User Story 3
- [X] T025 [P] [US3] Criar componente do Mapa de Calor geral em src/components/MeetingHeatmap.vue
- [X] T026 [P] [US3] Criar componente do painel de auditoria side-by-side em src/components/AuditPanel.vue
- [X] T027 [US3] Criar view view_heatmap_disponibilidade no banco de dados em db/migrations/002_triggers_and_rules.sql
- [X] T028 [US3] Implementar painel do administrador em src/pages/ManagerDashboard.vue
- [X] T029 [US3] Desenvolver módulo de exportação formatada de dados do SRC em src/services/srcExport.ts

**Checkpoint**: Equipe de coordenação possui controle operacional de auditoria, mapa de calor e exportação institucional.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes finos de UX, segurança e conformidade de diretrizes de código.

- [X] T030 Fazer varredura de código para remover comentários desnecessários, obsoletos ou citações de acordo com a Constituição IV
- [X] T031 [P] Implementar skeletons de carregamento e tratamentos de erro amigáveis nas transições de página no frontend
- [X] T032 [P] Desenvolver e criar índices de performance no banco (SC-005) em db/migrations/001_init_schema.sql
- [X] T033 Executar todos os cenários de teste documentados no quickstart.md para homologação final

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Sem dependências.
- **Phase 2 (Foundational)**: Depende da conclusão da Phase 1. Bloqueia todas as fases subsequentes.
- **Phase 3 & 4 (P1 User Stories)**: Dependem da Phase 2. Podem rodar em paralelo.
- **Phase 5 (P2 User Story)**: Depende das Phases 3 e 4.
- **Phase N (Polish)**: Depende de todas as fases de histórias.

### Parallel Opportunities
- As tarefas de configuração básicas na Phase 2 (`T006` a `T009`) podem rodar em paralelo.
- As fases P1 de monitoria do aluno (`Phase 3`) e envio de atividades do monitor (`Phase 4`) podem ser desenvolvidas em paralelo por membros diferentes da equipe.
- Testes unitários/integração de banco e componentes (`T012`, `T013`, `T014`, `T017`, `T018`, `T019`, `T020`, `T024`, `T025`, `T026`) podem ser iniciados paralelamente.

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)
1. Concluir Setup e Foundational (Phase 1 e 2).
2. Desenvolver e validar o fluxo do Aluno (Phase 3).
3. Desenvolver e validar o fluxo do Monitor (Phase 4).
4. **Validar MVP**: Monitores enviando atividades com cálculo automático e alunos solicitando chamados.

### Incremental Delivery
1. Liberar MVP para os monitores e comunidade externa.
2. Adicionar o Painel de Gestão (Phase 5) para auditorias da coordenação.
3. Aplicar polimentos finais (Phase N).
