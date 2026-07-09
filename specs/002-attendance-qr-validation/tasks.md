# Tasks: Validação de Atendimentos via QR Code

**Input**: Design documents from `/specs/002-attendance-qr-validation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only manual validation scenarios listed in quickstart.md are requested for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `lampex-control/src/`, `lampex-control/db/`
- **Backend (API)**: `lampex-control-api/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Update migration execution script in `lampex-control/db/apply_migrations.js` to register and run the new migration `008_attendance_validation_qr.sql`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database tables and API routing that must be complete before any user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Setup database schema migration file `lampex-control/db/migrations/008_attendance_validation_qr.sql` to create the `registro_atendimento` table with UUID key, foreign key referencing `monitor(id) ON DELETE SET NULL`, and check constraints for modalidade and hours_duracao
- [x] T003 [P] Setup base endpoint routing definitions for registration and reports inside `lampex-control-api/src/index.ts` to allow handling resource names `atendimentos/registrar`, `relatorios/monitores`, and `relatorios/alunos`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Registro de Atendimento pelo Aluno via QR Code (Priority: P1) 🎯 MVP

**Goal**: Permitir que os alunos registrem os atendimentos do laboratório de forma digital pelo celular, informando matrícula, nome, modalidade, local/link e duração em horas.

**Independent Test**: Acessar a rota `/atendimento-rapido` no frontend, preencher e enviar o formulário, e verificar se os dados correspondentes foram criados com sucesso na tabela `registro_atendimento` do banco de dados PostgreSQL.

### Implementation for User Story 1

- [x] T004 [P] [US1] Implement `POST /api/atendimentos/registrar` (endpoint público) inside `lampex-control-api/src/index.ts` to validate fields, format data, and insert the registration into the database
- [x] T005 [P] [US1] Register route `/atendimento-rapido` mapping to the new component `MonitoriaRapida.vue` in `lampex-control/src/router/index.ts`
- [x] T006 [US1] Develop frontend view component `lampex-control/src/pages/MonitoriaRapida.vue` (mobile-first responsive view, loads active monitors dynamically from API using `GET /api/monitor`, form with fields, validations for matricula/duracao, and handles form submission)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Visualização de Relatórios de Monitoria e Produtividade (Priority: P2)

**Goal**: Fornecer ao gestor/coordenação relatórios de produtividade dos monitores com fator de planejamento x2 e consumo real dos alunos na aba do painel administrativo.

**Independent Test**: Fazer login como gestor no dashboard, acessar a aba "Relatórios", escolher um período de datas e verificar se ambas as tabelas (Monitores e Alunos) mostram os cálculos de horas agregados e corretos sob a paleta verde institucional `#008744`.

### Implementation for User Story 2

- [x] T007 [P] [US2] Implement `GET /api/relatorios/monitores` (endpoint protegido) inside `lampex-control-api/src/index.ts` to filter by start/end date, group by monitor ID, apply the `SUM(horas_duracao * 2)` aggregate, and check that JWT claims have the role `'gestor'`
- [x] T008 [P] [US2] Implement `GET /api/relatorios/alunos` (endpoint protegido) inside `lampex-control-api/src/index.ts` to filter by start/end date, group by student matricula and name, apply the `SUM(horas_duracao)` aggregate, and check that JWT claims have the role `'gestor'`
- [x] T009 [US2] Update `lampex-control/src/pages/ManagerDashboard.vue` to add the "Relatórios" tab, date filter inputs (Initial/Final Date), and two styled HTML tables that fetch and render productivity and consumption data from the new endpoints

**Checkpoint**: User Stories 1 and 2 are fully functional and integrated.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T010 [P] Check CORS header responses and error handling on newly created endpoints in `lampex-control-api/src/index.ts`
- [x] T011 Run e2e manual validations using quickstart guide in `specs/002-attendance-qr-validation/quickstart.md`
- [x] T012 [P] Update feature status to Completed in `specs/002-attendance-qr-validation/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Can integrate with US1 but is independently testable

### Within Each User Story

- Models/database schema before services/API handlers
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- Once Foundational phase completes, User Story 1 and User Story 2 can be developed in parallel (if team capacity allows)
- Backend handlers `T004`, `T007`, and `T008` can be developed in parallel (though T007 and T008 touch the same backend router file, their implementation is independent)
- Frontend router mapping `T005` can run in parallel with the backend handler `T004`

---

## Parallel Example: User Story 1

```bash
# Launch backend handler and router mapping together:
Task: "Implement POST /api/atendimentos/registrar (endpoint público) inside lampex-control-api/src/index.ts"
Task: "Register route /atendimento-rapido mapping to the new component MonitoriaRapida.vue in lampex-control/src/router/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently using step 1 of quickstart.md
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Each story adds value without breaking previous stories
