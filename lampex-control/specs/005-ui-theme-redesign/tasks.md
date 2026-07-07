# Tasks: UI Theme Redesign

**Input**: Design documents from `/specs/005-ui-theme-redesign/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/ui-style-contract.md

**Tests**: No automated styling tests are requested. Validation will be performed manually following the scenarios in quickstart.md and by running the existing functional integration test suite.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (e.g. `src/style.css`)
- Paths shown below assume the single project structure defined in plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Register / verify feature branch `005-ui-theme-redesign` is active
- [x] T002 Verify local build can execute successfully using `npm run build`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core CSS style variables and theme setup that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Define the new IFES & LAMPEX color design tokens in `src/style.css`
- [x] T004 Map legacy dark-theme CSS variables in `src/style.css` to the new tokens (e.g., `--bg-primary` -> `var(--color-bg-main)`)
- [x] T005 Adjust global layout elements, fonts, body background, and default input border-focus styles in `src/style.css` to enforce light-theme default states

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Acesso com Tema Institucional no Login (Priority: P1) 🎯 MVP

**Goal**: Apply the new institutional palette to the login page, updating input focus states, button styles, errors, and rendering the official logo assets.

**Independent Test**: Navigate to `/login`, verify page background is pure white, the login button is green `#008744` (transitioning to `#005c2e` on hover), input borders focus to `#008744`, and incorrect logins show error messages in red `#d62d20`.

### Implementation for User Story 1

- [x] T006 [US1] Remove dark glass-card styles and configure a white background card layout in `src/pages/Login.vue`
- [x] T007 [US1] Reference and display the official logo assets (`assets/ifes_icon.png` and `assets/lampex_icon.jpg`) inside the login form header in `src/pages/Login.vue`
- [x] T008 [US1] Style input fields and the action button in `src/pages/Login.vue` to use the primary green color (`#008744`), hover state (`#005c2e`), and configure authentication errors in red (`#d62d20`)

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Visualização do Painel de Gestão Consolidado (Priority: P2)

**Goal**: Update the manager dashboard navbar, titles, tab elements, and badges to match the institutional palette.

**Independent Test**: Log in as a gestor, navigate to `/manager-dashboard`, verify the navbar background is green `#008744`, no blue/purple gradients remain on titles, active tabs show green indicators, gestor badge is red `#d62d20`, and monitor badge is green `#008744`.

### Implementation for User Story 2

- [x] T009 [US2] Update navbar component styling in `src/App.vue` to use the primary green background (`#008744`) with white text, and style text links appropriately
- [x] T010 [US2] Remove blue-purple gradients and update title and tab selection styling in `src/pages/ManagerDashboard.vue` to conform to the green/dark-text theme
- [x] T011 [US2] Update list tables and subcomponent headers in `src/components/AuditPanel.vue` and `src/components/MeetingHeatmap.vue` to align with the new light-theme design tokens
- [x] T012 [US2] Implement/update role badge rendering styles across the dashboard to style `gestor` in red (`#d62d20`) and `monitor` in green (`#008744`)

**Checkpoint**: User Stories 1 and 2 are fully functional and work together independently

---

## Phase 5: User Story 3 - Coesão Visual nas Demais Telas (Priority: P3)

**Goal**: Verify all other pages and secondary layouts are compatible with the global light theme.

**Independent Test**: Navigate to the home page, monitor profile, and weekly submission routes to verify visual cleanliness and consistency.

### Implementation for User Story 3

- [x] T013 [US3] Adapt layout cards, titles, and buttons in `src/pages/Home.vue` to use the light theme (white background, green action button, no blue/purple gradients)
- [x] T014 [US3] Check and adjust styling compatibility in `src/pages/MonitorProfile.vue`, `src/pages/RequestStatus.vue`, and `src/pages/WeeklySubmission.vue` to ensure they render correctly on the new white background

**Checkpoint**: All user stories are independently functional and integrated

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Post-redesign validation, cleanup, and assurance

- [x] T015 Verify the frontend builds successfully without compiler/TypeScript errors using `npm run build`
- [x] T016 Run all existing integration tests in `tests/integration/` to ensure no route guards or functional authentication logic was broken by layout changes
- [x] T017 Run and document the validation checklist scenarios from `specs/005-ui-theme-redesign/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. BLOCKS all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion. Can be worked on sequentially (US1 → US2 → US3) or in parallel.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### Parallel Opportunities

- Foundational tasks `T003` and `T004` can run in parallel.
- Once Phase 2 is complete, US1 and US2 implementation tasks can run in parallel if staffed by multiple developers.
- Phase 3 task `T006` and `T007` can run in parallel since they modify different sections of the same component template.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational phases.
2. Complete US1 (Login Screen Redesign).
3. **STOP and VALIDATE**: Verify that login looks and works perfectly on `/login`.

### Incremental Delivery

1. Setup + Foundation -> Theme base ready.
2. US1 -> Login theme ready (MVP!).
3. US2 -> Manager Dashboard theme ready.
4. US3 -> Rest of the site theme ready.
5. Polish -> Run full test suite and confirm quickstart scenarios.
