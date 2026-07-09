# Tasks: Plataforma de Governança de Ações de Extensão

**Input**: Design documents from `/specs/004-extension-governance/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/extension-contracts.md

**Tests**: Tests are manual and validated via end-to-end user journeys defined in quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create the database migration script in lampex-control/db/migrations/013_extension_governance.sql
- [X] T002 Update the migration list configuration in lampex-control/db/apply_migrations.js to include 013_extension_governance.sql

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Execute the SQL migration commands in lampex-control/db/migrations/013_extension_governance.sql against the PostgreSQL database in Aiven

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Seleção Dinâmica de Ações de Extensão e Filtragem de Voluntários (Priority: P1) 🎯 MVP

**Goal**: Enable students to select an active extension action and dynamically filter the volunteer list by that action.

**Independent Test**: Access the form page, select "Projeto Include" and verify that the monitors selector lists only the volunteers linked to that action.

### Implementation for User Story 1

- [X] T004 [P] [US1] Implement database query mapping for GET /api/acao_extensao in lampex-control-api/src/index.ts to fetch active actions
- [X] T005 [P] [US1] Update SELECT fields in GET /api/monitor and GET /api/usuario inside lampex-control-api/src/index.ts to return acao_id and support eq filtering on it
- [X] T006 [P] [US1] Create getActionsOfExtension API service and update getActiveMonitors in lampex-control/src/services/apiService.ts to support acao_id filtering
- [X] T007 [US1] Refactor lampex-control/src/pages/MonitoriaRapida.vue to fetch actions on mount, render the select dropdown, and watch selection changes to filter the volunteer list

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Validação de Integridade por Matrícula do Voluntário (Priority: P1)

**Goal**: Validate the volunteer's identity using the last 4 characters of their matricula.

**Independent Test**: Register attendance with a wrong 4-digit code and expect a validation rejection error. Put correct code and expect success.

### Implementation for User Story 2

- [X] T008 [US2] Update POST /api/atendimentos/registrar in lampex-control-api/src/index.ts to require acao_id and validate the last 4 digits of the volunteer's matricula from the database
- [X] T009 [P] [US2] Update AttendanceRegistrationPayload interface in lampex-control/src/services/apiService.ts to make acao_id mandatory
- [X] T010 [US2] Modify lampex-control/src/pages/MonitoriaRapida.vue to add the mandatory 4-digit input field and pass the acao_id and code in the registration payload

**Checkpoint**: At this point, User Stories 1 and 2 should work independently.

---

## Phase 5: User Story 3 - Validação de Presença com Senha do Dia (Priority: P1)

**Goal**: Verify daily passcode for professor sessions.

**Independent Test**: Select "Presencial com Professor" modality, enter correct password and verify registration success.

### Implementation for User Story 3

- [X] T011 [US3] Update validation in POST /api/atendimentos/registrar inside lampex-control-api/src/index.ts to check senha_aula against monitoria_professor table and write to senha_sessao and professor_id in registro_atendimento
- [X] T012 [US3] Update lampex-control/src/pages/MonitoriaRapida.vue to render the passcode input field conditionally via v-if for "Presencial com Professor" modality

**Checkpoint**: At this point, User Stories 1, 2, and 3 should work independently.

---

## Phase 6: User Story 4 - Relatórios Consolidados por Ação de Extensão (Priority: P2)

**Goal**: Group reports and metrics by Ação de Extensão in the coordinator dashboard.

**Independent Test**: Open reports page, verify that both volunteer hours (with x2 factor) and student hours are grouped and displayed under their respective action names.

### Implementation for User Story 4

- [X] T013 [P] [US4] Update GET /api/relatorios/monitores in lampex-control-api/src/index.ts to aggregate hours grouped by acao_id and acao_nome
- [X] T014 [P] [US4] Update GET /api/relatorios/alunos in lampex-control-api/src/index.ts to aggregate hours grouped by acao_id and acao_nome
- [X] T015 [US4] Update lampex-control/src/components/ReportsPanel.vue to render report metrics grouped by Ação de Extensão
- [X] T016 [US4] Update lampex-control/src/components/AuditPanel.vue to display the action name associated with the volunteer of the weekly report

**Checkpoint**: Reports and auditoria are now fully categorized by action.

---

## Phase 7: User Story 5 - Promoção e Rebaixamento de Bolsistas (Priority: P2)

**Goal**: Allow managers to easily promote/demote volunteers to gestor_temporario.

**Independent Test**: Toggle promotion button on a volunteer in the dashboard, verify role updates to gestor_temporario, toggle again to revert.

### Implementation for User Story 5

- [X] T017 [US5] Verify that the PATCH /api/usuario endpoint in lampex-control-api/src/index.ts handles role update payload for gestor_temporario correctly
- [X] T018 [US5] Verify that the toggle button in lampex-control/src/pages/ManagerDashboard.vue calls updateMonitorRole correctly to change role between voluntario and gestor_temporario

**Checkpoint**: All user stories are fully implemented and functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final checks and adjustments

- [X] T019 Run all verification scenarios in specs/004-extension-governance/quickstart.md to validate the changes end-to-end
- [X] T020 Perform final code cleanup and verify TypeScript types and compilation in both projects

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational (Phase 2).
  - Can proceed sequentially (P1 → P2 → P3).
- **Polish (Phase 8)**: Depends on all user stories being complete.

### Parallel Opportunities

- T004, T005, T006, and T007 can be developed in parallel by separate team members after Phase 2 is complete.
- T013 and T014 can be implemented concurrently.

---

## Parallel Example: User Story 1

```bash
# Developer A:
Task: "Implement database query mapping for GET /api/acao_extensao in lampex-control-api/src/index.ts"

# Developer B:
Task: "Create getActionsOfExtension API service and update getActiveMonitors in lampex-control/src/services/apiService.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Complete Setup and Foundational database changes.
2. Implement User Story 1 (Seleção Dinâmica) and User Story 2 (Validação de Matrícula).
3. Validate and verify using quickstart Cenário 1 and Cenário 2.
4. Deploy MVP.
