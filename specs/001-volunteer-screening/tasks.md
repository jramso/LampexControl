# Tasks: Fluxo de Triagem de Voluntários

**Input**: Design documents from `/specs/001-volunteer-screening/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/volunteer-api.md, quickstart.md

**Tests**: N/A (Não solicitados explicitamente na especificação)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `lampex-control/src/`
- **Backend**: `lampex-control-api/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and validation of environment configurations

- [x] T001 Verify project workspace directories and verify database connection configurations in `lampex-control-api/.dev.vars`
- [x] T002 Configure local environment configurations for development (VITE_API_URL mapping) in `lampex-control/.env`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema modifications and routing infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create PostgreSQL migration script for table `potencial_voluntario` in `lampex-control/db/migrations/005_volunteer_screening.sql`
- [x] T004 Apply the new migration to the Aiven database by running `lampex-control/db/apply_migrations.js`
- [x] T005 [P] Setup endpoint routing structure for `/api/voluntarios/*` endpoints in `lampex-control-api/src/index.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Cadastro Público de Potenciais Voluntários (Priority: P1) 🎯 MVP

**Goal**: Permitir que estudantes enviem dados cadastrais e origem no formulário público.

**Independent Test**: O usuário acessa `/cadastro`, preenche e submete os dados, que são guardados no banco com status 'Pendente'.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create registration component `CadastroMonitor.vue` with form validation in `lampex-control/src/components/CadastroMonitor.vue`
- [x] T007 [US1] Register `/cadastro` path mapping in frontend router `lampex-control/src/router/index.ts`
- [x] T008 [US1] Implement registration endpoint `POST /api/voluntarios/cadastro` in `lampex-control-api/src/index.ts`
- [x] T009 [US1] Create API service function `registerVolunteer` in `lampex-control/src/services/apiService.ts`
- [x] T010 [US1] Integrate `CadastroMonitor.vue` submission with the api service and validation feedback in `lampex-control/src/components/CadastroMonitor.vue`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Visualização de Candidatos na Triagem (Priority: P2)

**Goal**: Permitir que gestores visualizem a fila de candidatos pendentes no painel de administração.

**Independent Test**: O gestor faz login e acessa a aba "Triagem", renderizando a listagem de voluntários pendentes.

### Implementation for User Story 2

- [x] T011 [US2] Implement list pending endpoint `GET /api/voluntarios/pendentes` in `lampex-control-api/src/index.ts`
- [x] T012 [P] [US2] Create list component `TriagemPanel.vue` for pending applications in `lampex-control/src/components/TriagemPanel.vue`
- [x] T013 [US2] Register "Triagem" tab inside gestor dashboard `lampex-control/src/pages/ManagerDashboard.vue`
- [x] T014 [US2] Create API service function `getPendingVolunteers` in `lampex-control/src/services/apiService.ts`
- [x] T015 [US2] Integrate table rendering and fetch logic inside `lampex-control/src/components/TriagemPanel.vue`

**Checkpoint**: At this point, User Stories 1 and 2 should work.

---

## Phase 5: User Story 3 - Aprovação e Promoção de Candidatos (Priority: P1)

**Goal**: Permitir que gestores aprovem candidatos migrando-os automaticamente para monitores.

**Independent Test**: O gestor clica em "Aprovar" (verde), o voluntário é removido da fila e inserido na tabela `monitor`.

### Implementation for User Story 3

- [x] T016 [US3] Implement transactional approval endpoint `POST /api/voluntarios/:id/aprovar` in `lampex-control-api/src/index.ts`
- [x] T017 [US3] Create API service function `approveVolunteer` in `lampex-control/src/services/apiService.ts`
- [x] T018 [US3] Add action button (green `#008744`) and click handler in `lampex-control/src/components/TriagemPanel.vue`

**Checkpoint**: User Stories 1, 2, and 3 should now be fully functional.

---

## Phase 6: User Story 4 - Rejeição de Candidatos (Priority: P2)

**Goal**: Permitir que gestores rejeitem candidatos atualizando o status na triagem sem criar monitores.

**Independent Test**: O gestor clica em "Rejeitar" (vermelho), o candidato desaparece e é marcado no banco como 'Rejeitado'.

### Implementation for User Story 4

- [x] T019 [US4] Implement rejection endpoint `POST /api/voluntarios/:id/rejeitar` in `lampex-control-api/src/index.ts`
- [x] T020 [US4] Create API service function `rejectVolunteer` in `lampex-control/src/services/apiService.ts`
- [x] T021 [US4] Add action button (red `#d62d20`) and click handler in `lampex-control/src/components/TriagemPanel.vue`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T022 Verify CORS options preflight header rules on all custom endpoints in `lampex-control-api/src/index.ts`
- [x] T023 Run validation scenarios described in `specs/001-volunteer-screening/quickstart.md` using development environments
- [x] T024 Perform codebase cleanup and remove any leftover debug console statements in both subprojects

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - User Story 1 (P1) and User Story 3 (P1) are Critical Path and should be prioritized.
  - User Story 2 (P2) is needed to display candidates for Story 3.
  - User Story 4 (P2) is independent and can be done last.
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### Parallel Opportunities

- Foundational tasks `T005` can run in parallel with database configurations.
- `T006` (Frontend view) and `T008` (Backend endpoint) of User Story 1 can run in parallel.
- `T012` (Frontend component) and `T011` (Backend endpoint) of User Story 2 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch frontend development of CadastroMonitor.vue and backend endpoint development in parallel:
Task: "Create registration component CadastroMonitor.vue with form validation in lampex-control/src/components/CadastroMonitor.vue"
Task: "Implement registration endpoint POST /api/voluntarios/cadastro in lampex-control-api/src/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Submitting the form writes database records with status 'Pendente'.
5. Proceed to admin dashboard implementation (User Story 2, 3, and 4).
