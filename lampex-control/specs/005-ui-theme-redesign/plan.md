# Implementation Plan: UI Theme Redesign

**Branch**: `005-ui-theme-redesign` | **Date**: 2026-07-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-ui-theme-redesign/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement the visual identity of IFES & LAMPEX across the frontend application. The styling approach shifts the application from a dark theme (deep blue/purple/gray) to a light theme: pure white background (`#ffffff`), institutional green (`#008744`) for primary elements/focus states, and alert red (`#d62d20`) for gestor/critical status badges. To minimize risk, legacy CSS variables in `src/style.css` will be mapped to the new institutional design tokens, and components with inline dark-mode styles (like `Login.vue` and `ManagerDashboard.vue`) will be updated to ensure contrast and visual harmony.

## Technical Context

**Language/Version**: TypeScript 6.0, Node.js (Vite environment)

**Primary Dependencies**: Vue 3.5, vue-router, @supabase/postgrest-js

**Storage**: PostgreSQL (Aiven database consumed via PostgREST) - *No storage model modifications needed for this UI task*

**Testing**: vitest (for unit/component tests)

**Target Platform**: Web Browsers, deployed on Cloudflare Pages

**Project Type**: web-service/web-app

**Performance Goals**: UI rendering/interaction transitions under 150ms; keep stylesheet bundle minimal.

**Constraints**: Pure vanilla CSS styles; strict compliance with WCAG AA contrast ratio of 4.5:1 on light backgrounds.

**Scale/Scope**: Modifying 1 global style sheet (`style.css`), 2 vue pages (`Login.vue`, `ManagerDashboard.vue`), and checking 2 dashboard subcomponents (`AuditPanel.vue`, `MeetingHeatmap.vue`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Gate 1: Decoupled MVC Architecture (Principle I)**: PASSED. This task is purely visual (View layer) and does not introduce database or PostgREST logic modifications.
- **Gate 2: Static Typings in schema.ts (Principle III)**: PASSED. No custom API TypeScript interfaces will be written manually.
- **Gate 3: Clean Code & Comments (Principle IV)**: PASSED. All stylesheet and Vue changes will be clean, readable, and free of redundant or obvious comments.

## Project Structure

### Documentation (this feature)

```text
specs/005-ui-theme-redesign/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── contracts/           # Phase 1 output (/speckit-plan command)
    └── ui-style-contract.md
```

### Source Code (repository root)

```text
src/
├── style.css
├── components/
│   ├── AuditPanel.vue
│   └── MeetingHeatmap.vue
└── pages/
    ├── Login.vue
    └── ManagerDashboard.vue
```

**Structure Decision**: Single project layout (Option 1) is chosen, as the application is structured as a consolidated frontend single-page application.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations of the Constitution identified.
