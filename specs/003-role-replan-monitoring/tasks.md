# Tasks: Replanejamento de Cargos e Monitoria com Professor

**Input**: Design documents from `/specs/003-role-replan-monitoring/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification or requested by the user.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `lampex-control/src/`
- **Backend**: `lampex-control-api/src/`
- **Migrations**: `lampex-control/db/migrations/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migrations and initial schema updates

- [X] T001 Create the database migration file to update check constraints, roles, and create the monitoria_professor table in lampex-control/db/migrations/010_role_replan_monitoring.sql
- [X] T002 Execute database migrations to apply the schema updates in PostgreSQL in lampex-control/db/migrations/010_role_replan_monitoring.sql

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update authentication, permissions, and roles verification logic across the backend

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Update backend authentication role verification logic to accept 'gestor_fixo' and 'gestor_temporario' in place of the old 'gestor' check in lampex-control-api/src/index.ts
- [X] T004 Update JWT claims decoding and interface structures to support the new roles ('voluntario', 'professor', 'gestor_fixo', 'gestor_temporario') in lampex-control-api/src/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Validação de Matrícula (Priority: P1) 🎯 MVP

**Goal**: Force verification of the last 4 digits of the monitor's matrícula when submitting the attendance form

**Independent Test**: Student selects a monitor and inputs an incorrect 4-digit code in the form. The system displays a validation error and rejects the request.

### Implementation for User Story 1

- [X] T005 [P] [US1] Update the `POST /api/atendimentos/registrar` handler to retrieve the monitor's matrícula and verify if the request's `codigo_monitor` matches the last 4 digits in lampex-control-api/src/index.ts
- [X] T006 [P] [US1] Add the `codigo_monitor` property to the typescript interface and payload of `registerAttendance` function in lampex-control/src/services/apiService.ts
- [X] T007 [US1] Inject the "Código do Monitor" input field in the quick attendance form in lampex-control/src/pages/MonitoriaRapida.vue
- [X] T008 [US1] Update the submission logic and validations to send `codigo_monitor` in lampex-control/src/pages/MonitoriaRapida.vue

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Monitoria Especial "Presencial com Professor" (Priority: P1)

**Goal**: Enable daily passcode validation when selecting the "Presencial com Professor" modality

**Independent Test**: Student selects "Presencial com Professor" modality, types a valid and active passcode for the current day, and the system registers the attendance successfully. Entering an invalid passcode yields a 400 validation error.

### Implementation for User Story 2

- [X] T009 [P] [US2] Update backend `POST /api/atendimentos/registrar` endpoint to verify if `modalidade` is `'Presencial com Professor'`, checking that `senha_aula` is provided and matches an active, current-day `'Ativo'` passcode in monitoria_professor for that monitor_id (professor) in lampex-control-api/src/index.ts
- [X] T010 [P] [US2] Update payload interface in apiService to accept optional `senha_aula` parameter in lampex-control/src/services/apiService.ts
- [X] T011 [US2] Add the `'Presencial com Professor'` option to the modality select field in lampex-control/src/pages/MonitoriaRapida.vue
- [X] T012 [US2] Add a conditional "Senha de Aula" password input field that is shown only when modalidade is `'Presencial com Professor'` in lampex-control/src/pages/MonitoriaRapida.vue
- [X] T013 [US2] Modify form submisson parameters in frontend to include the `senha_aula` in the payload for professor modality in lampex-control/src/pages/MonitoriaRapida.vue

**Checkpoint**: User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Gestão de Cargos de Gestores Temporários (Priority: P2)

**Goal**: Enable coordinators to promote or demote Bruno Gestor and Emmanuel Gestor to/from `gestor_temporario` on the dashboard

**Independent Test**: Login as Josué (gestor_fixo), click to promote Bruno Gestor to gestor temporário, log in as Bruno Gestor and verify access to administrative tools. Click to demote Bruno Gestor and verify access is revoked.

### Implementation for User Story 3

- [X] T014 [P] [US3] Update the `PATCH /api/monitor` backend handler to allow modifying the `role` field only when the requester's JWT claims have `role = 'gestor_fixo'` in lampex-control-api/src/index.ts
- [X] T015 [P] [US3] Create or update service helper to update monitor role via backend PATCH requests in lampex-control/src/services/apiService.ts
- [X] T016 [US3] Create the "Gestão de Acesso Temporário" UI tool listing Bruno Gestor and Emmanuel Gestor with promote/demote action buttons in lampex-control/src/pages/ManagerDashboard.vue
- [X] T017 [US3] Connect dashboard toggle buttons to call the role update service function and refresh the UI state in lampex-control/src/pages/ManagerDashboard.vue

**Checkpoint**: User Story 3 should now be functional and testable independently

---

## Phase 6: User Story 4 - Geração e Controle de Senhas de Aula pelo Professor (Priority: P1)

**Goal**: Enable professors to generate and close daily class passcodes on their profile page

**Independent Test**: Log in as a professor, generate a new passcode "aula456" for the day, and confirm it is listed as Active. Click "Encerrar Recebimento" and confirm its status changes to Closed.

### Implementation for User Story 4

- [X] T018 [P] [US4] Create backend API routes POST, GET, and PATCH on `/api/monitoria-professor` to create, list, and update passcode objects, verifying requester is a professor in lampex-control-api/src/index.ts
- [X] T019 [P] [US4] Implement frontend API service functions in apiService to call the monitoria-professor endpoints in lampex-control/src/services/apiService.ts
- [X] T020 [US4] Add the "Gerenciamento de Aulas" panel inside the profile page visible only for role 'professor' in lampex-control/src/pages/MonitorProfile.vue
- [X] T021 [US4] Connect the passcode UI buttons to call create/close service functions and update the state in lampex-control/src/pages/MonitorProfile.vue

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Post-implementation validations, seed modifications, and final testing

- [X] T022 Update local seed script to include the new roles `'voluntario'`, `'professor'`, `'gestor_fixo'`, `'gestor_temporario'` for Bruno Gestor and Emmanuel Gestor in lampex-control/db/migrations/004_seed_data.sql
- [X] T023 Update local seed script to seed alternative gestores under the new `'gestor_fixo'` role in lampex-control/db/migrations/007_add_gestores.sql
- [X] T024 Run the quickstart validation scenarios locally and confirm all tests pass successfully in specs/003-role-replan-monitoring/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US4 (needs active daily passcode to validate)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Completely decoupled UI page and endpoints
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - No dependencies, provides daily passcodes for US2

### Within Each User Story

- Models/database migrations before API services
- API services before page/form inputs
- Form inputs before validation and integration

### Parallel Opportunities

- Setup tasks T001 and T002 can be executed sequentially
- Foundational tasks T003 and T004 can be executed in parallel
- Once Phase 2 is complete, US1, US3, and US4 can be worked on concurrently

---

## Implementation Strategy

### MVP First (User Story 1 & 4 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 6: User Story 4 (Professor Passcode Generation)
4. Complete Phase 3: User Story 1 (Matrícula verification)
5. Complete Phase 4: User Story 2 (Modality verification against daily passcode)
6. Complete Phase 5: User Story 3 (Dashboard manager promotion)
