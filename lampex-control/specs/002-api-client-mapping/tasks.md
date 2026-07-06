# Tasks: Mapeamento de Chamados da API

**Input**: Design documents from `/specs/002-api-client-mapping/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/client-endpoints.md, quickstart.md

**Tests**: Tests are included to validate API request schemas and data retrieval rules using Vitest integration tests.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização da infraestrutura física do mapeamento da API.

- [X] T001 Criar arquivo de migração contendo aliases e views da API em db/migrations/003_api_mappings.sql

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Aplicação de esquemas de banco de dados e atualização de tipos estáticos no cliente.

**⚠️ CRITICAL**: Nenhuma tarefa das histórias de usuário pode começar até que esta fase esteja completa.

- [X] T002 Aplicar script de migração db/migrations/003_api_mappings.sql na base de dados Aiven
- [X] T003 [P] Executar CLI openapi-typescript para atualizar as definições em src/services/schema.ts
- [X] T004 [P] Criar arquivo de serviços em TypeScript em src/services/apiService.ts

**Checkpoint**: Contratos mapeados no banco e client de tipos atualizado.

---

## Phase 3: User Story 1 - Cadastro de Solicitações de Monitoria (Priority: P1) 🎯 MVP

**Goal**: Permitir que o aluno envie dados obrigatórios conforme a LGPD usando a rota /solicitacoes_monitoria.

**Independent Test**: Submeter dados completos de aluno e verificar a criação do registro na tabela correspondente.

### Tests for User Story 1
- [X] T005 [P] [US1] Criar teste de integração para o serviço de criação em tests/integration/us1_api_requests.test.ts

### Implementation for User Story 1
- [X] T006 [US1] Implementar o método createTutoringRequest no arquivo src/services/apiService.ts
- [X] T007 [US1] Atualizar o formulário de chamada em src/components/TutoringRequestForm.vue para consumir o novo serviço

**Checkpoint**: Alunos conseguem submeter chamados enviando os dados obrigatórios da LGPD.

---

## Phase 4: User Story 2 - Registro Consolidado com Anexos (Priority: P1) 🎯 MVP

**Goal**: Permitir múltiplos lançamentos de atividades por semana de referência associados a links de evidência.

**Independent Test**: Enviar relatório consolidado com múltiplos itens e comprovar inserção atômica no banco de dados.

### Tests for User Story 2
- [X] T008 [P] [US2] Criar teste de integração para submissão consolidada em tests/integration/us2_api_reports.test.ts

### Implementation for User Story 2
- [X] T009 [US2] Implementar o método submitWeeklyReport no arquivo src/services/apiService.ts
- [X] T010 [US2] Atualizar a tela de submissão em src/pages/WeeklySubmission.vue para consumir o novo serviço

**Checkpoint**: Monitores salvando múltiplos registros semanais com segurança e atomicidade.

---

## Phase 5: User Story 3 - Views de Agregação e Privacidade (Priority: P2)

**Goal**: Consumir views /view_reuniao_geral e /view_contato_monitor para exibição de heatmap e dados autorizados.

**Independent Test**: Carregar mapa de calor ponderado e buscar telefone do monitor de chamado confirmado.

### Tests for User Story 3
- [X] T011 [P] [US3] Criar testes de integração para as views agregadas em tests/integration/us3_api_views.test.ts

### Implementation for User Story 3
- [X] T012 [US3] Implementar os métodos getGeneralHeatmap e getMonitorContact no arquivo src/services/apiService.ts
- [X] T013 [US3] Atualizar componente de heatmap em src/components/MeetingHeatmap.vue para consumir a nova view
- [X] T014 [US3] Atualizar tela de status em src/pages/RequestStatus.vue para buscar dados de contato via nova view

**Checkpoint**: Gestão e alunos visualizando dados consolidados respeitando os filtros de status e privacidade.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes finos de tratamento de erros de rede e polimento.

- [X] T015 Tratar erros de rate limiting e status HTTP 429 de forma amigável no arquivo src/services/apiService.ts
- [X] T016 Executar todos os cenários de validação descritos em specs/002-api-client-mapping/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Sem dependências.
- **Phase 2 (Foundational)**: Depende da Phase 1. Bloqueia as fases subsequentes.
- **Phase 3 & 4 (P1 User Stories)**: Dependem da Phase 2. Podem rodar em paralelo.
- **Phase 5 (P2 User Story)**: Depende das Phases 3 e 4.
- **Phase N (Polish)**: Depende de todas as fases de histórias.

### Parallel Opportunities
- As tarefas de configuração `T003` e `T004` podem rodar em paralelo na Phase 2.
- O desenvolvimento do fluxo do Aluno (Phase 3) e do Monitor (Phase 4) pode ocorrer em paralelo.
- Os testes unitários e de integração de cada User Story (`T005`, `T008`, `T011`) podem ser desenvolvidos de forma paralela.

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)
1. Concluir Setup e Foundational (Phase 1 e 2).
2. Desenvolver e validar o cadastro de chamados (Phase 3).
3. Desenvolver e validar a submissão de atividades (Phase 4).
4. **Validar MVP**: Chamados e registros semanais integrados aos novos endpoints de mapeamento.

### Incremental Delivery
1. Liberar MVP com chamados públicos e envio de relatórios.
2. Adicionar painel de controle de views agregadas de reuniões e contatos (Phase 5).
3. Aplicar polimentos finais de rate limiting e validações (Phase N).
