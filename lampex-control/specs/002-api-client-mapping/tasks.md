# Tasks: Mapeamento de Chamados da API

**Input**: Design documents from `/specs/002-api-client-mapping/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/client-endpoints.md

**Tests**: Tests are requested in the spec.md and quickstart.md. We write integration tests using Vitest.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Instalação das dependências necessárias para a nova arquitetura.

- [ ] T001 Instalar as dependências do `axios` e `postgres` no arquivo `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Configuração do cliente de banco e cliente HTTP unificado que bloqueiam a lógica de rotas.

**⚠️ CRITICAL**: Nenhuma tarefa das histórias de usuário pode começar até que esta fase esteja completa.

- [ ] T002 Criar o utilitário de conexão global do banco de dados com a biblioteca `postgres` em `functions/api/db.ts`
- [ ] T003 Criar o arquivo inicial de tipos compartilhados TypeScript em `src/services/types.ts`
- [ ] T004 Implementar o cliente HTTP customizado com Axios em `src/services/apiClient.ts`

**Checkpoint**: Conexões de banco e cliente HTTP Axios configurados e prontos.

---

## Phase 3: User Story 1 - Registro de Solicitação de Monitoria sob a LGPD (Priority: P1) 🎯 MVP

**Goal**: Permitir que os alunos enviem solicitações de monitoria registrando dados protegidos no banco de dados através da rota `/api/solicitacoes_monitoria`.

**Independent Test**: Submeter o formulário informando todos os dados obrigatórios e verificar que a solicitação é gravada no sistema gerando um número de protocolo (ID único).

### Tests for User Story 1
- [ ] T005 [P] [US1] Criar teste de integração para o fluxo de solicitação de monitoria em `tests/integration/us1_tutoring_request.test.ts`

### Implementation for User Story 1
- [ ] T006 [US1] Adicionar as interfaces de tipo para `SolicitacaoMonitoria` em `src/services/types.ts`
- [ ] T007 [US1] Implementar a Cloudflare Page Function de inserção em `functions/api/solicitacoes_monitoria.ts`
- [ ] T008 [US1] Atualizar o componente de formulário do aluno em `src/components/TutoringRequestForm.vue` para consumir o endpoint via Axios

**Checkpoint**: Solicitações de monitoria com validação de CPF e status "Pendente" persistindo via Axios e Pages Functions.

---

## Phase 4: User Story 2 - Registro Semanal de Atividades (Priority: P1) 🎯 MVP

**Goal**: Permitir que monitores enviem relatórios semanais com múltiplas atividades em uma única transação atômica.

**Independent Test**: Enviar um relatório consolidado com três atividades de categorias distintas para uma mesma semana e verificar que todas foram vinculadas corretamente à semana de referência.

### Tests for User Story 2
- [ ] T009 [P] [US2] Criar teste de integração para submissão consolidada de atividades em `tests/integration/us2_monitor_reporting.test.ts`

### Implementation for User Story 2
- [ ] T010 [US2] Adicionar as interfaces de tipo para `RegistroSemanal` e `ItemAtividade` em `src/services/types.ts`
- [ ] T011 [US2] Implementar a Cloudflare Page Function transacional em `functions/api/rpc/registro_horas.ts`
- [ ] T012 [US2] Atualizar o formulário de folha de ponto do monitor em `src/components/WeeklyReportForm.vue` para enviar relatórios usando Axios

**Checkpoint**: Relatórios semanais e seus itens associados inseridos de forma transacional e atômica.

---

## Phase 5: User Story 3 - Consulta de Disponibilidade e Contatos Autorizados (Priority: P2)

**Goal**: Expor endpoints de consulta de mapa de calor e dados de contato do monitor com restrição de privacidade parametrizada.

**Independent Test**: Consultar a disponibilidade geral para reuniões e buscar as informações de WhatsApp de um monitor a partir de um agendamento com status "Confirmado".

### Tests for User Story 3
- [ ] T013 [P] [US3] Criar teste de integração para consultas de mapa de calor e contatos autorizados em `tests/integration/us3_manager_audit.test.ts`

### Implementation for User Story 3
- [ ] T014 [US3] Adicionar as interfaces de tipo para views agregadas em `src/services/types.ts`
- [ ] T015 [US3] Implementar a Cloudflare Page Function de leitura em `functions/api/view_reuniao_geral.ts`
- [ ] T016 [US3] Implementar a Cloudflare Page Function de contatos de monitor com injeção de JWT claims em `functions/api/view_contato_monitor.ts`
- [ ] T017 [US3] Atualizar a matriz de reuniões em `src/components/MeetingHeatmap.vue` e a tela de status do aluno em `src/pages/RequestStatus.vue` para carregar dados via Axios

**Checkpoint**: Mapa de calor carregado e contatos exibidos de forma segura com base nos filtros da view e RLS.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Limpeza de dependências legadas e documentação do ambiente integrado de desenvolvimento.

- [ ] T018 [P] Remover a dependência `@supabase/postgrest-js` e limpar arquivos TypeScript órfãos no diretório `src/services/`
- [ ] T019 [P] Atualizar as instruções de setup local e execução em `README.md`
- [ ] T020 Rodar o roteiro de testes integrado e validar todos os fluxos na porta 8788 via `specs/002-api-client-mapping/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Sem dependências.
- **Phase 2 (Foundational)**: Depende do Setup (Phase 1).
- **Phase 3 (User Story 1)**: Depende da Phase 2 (Foundational).
- **Phase 4 (User Story 2)**: Depende da Phase 2 (Foundational).
- **Phase 5 (User Story 3)**: Depende da Phase 2 (Foundational) e das views no banco.
- **Phase N (Polish)**: Depende de todas as fases anteriores.

### Parallel Opportunities
- As tarefas marcadas com `[P]` em todas as fases podem rodar em paralelo.
- Os testes integrados `T005`, `T009` e `T013` podem ser criados de forma paralela.

---

## Parallel Example: User Story 1
```bash
# Launch integration test file creation
Task: "Criar teste de integração para o fluxo de solicitação de monitoria em tests/integration/us1_tutoring_request.test.ts"

# Launch types definition
Task: "Adicionar as interfaces de tipo para SolicitacaoMonitoria em src/services/types.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)
1. Concluir Setup e Foundational (Phase 1 e 2).
2. Criar e validar a rota de criação de chamados `/api/solicitacoes_monitoria` (Phase 3).
3. Criar e validar a rota transacional `/api/rpc/registro_horas` (Phase 4).
4. **Validar MVP**: Garantir que o aluno registre chamados e o monitor registre horas pelo frontend na porta 8788.
