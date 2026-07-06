# Implementation Plan: LampexControl System

**Branch**: `001-lampex-control-system` | **Date**: 2026-07-06 | **Spec**: [spec.md](file:///C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/lampex-control/specs/001-lampex-control-system/spec.md)

**Input**: Feature specification from `specs/001-lampex-control-system/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

O sistema **LampexControl** automatiza o controle de monitorias, atividades semanais e auditoria de horas do laboratório LAMPEX do Ifes Serra. A solução adota uma arquitetura MVC desacoplada utilizando PostgreSQL na Aiven (Model), PostgREST como barramento de API (Controller) e Vue 3 + TypeScript no frontend (View) consumindo a API de forma 100% tipada com tipos estáticos gerados no `schema.ts`.

## Technical Context

**Language/Version**: TypeScript 5.x, Vue 3, PL/pgSQL (PostgreSQL 15+)

**Primary Dependencies**: `@supabase/postgrest-js`, `vue-router` (routing), `vite` (build system), `tailwind-merge` / Custom CSS

**Storage**: PostgreSQL (Aiven cloud hosting)

**Testing**: Vitest (frontend unit/integration tests), pgTAP (database schema and rules tests)

**Target Platform**: Modern Web Browsers (Chrome, Firefox, Edge, Safari)

**Project Type**: Decoupled Web Application (Vue 3 Single Page Application + PostgreSQL Remote Database)

**Performance Goals**: API response time below 2.0s under normal usage (SC-005), heatmap page loading in under 2 seconds (SC-004)

**Constraints**:
- **MVC postgREST restriction**: No traditional backend code (Node/Python). All controller logic must reside as Views, Triggers or RPC Functions directly in the PostgreSQL database.
- **LGPD compliance**: Restrict read/download access to PDF and evidence links (FR-010) and manage monitor contact privacy based on scheduling status (FR-003).

**Scale/Scope**: ~50 active monitors, ~1000 requests per year, light data volume.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Status | Alignment & Execution Details |
|------------------|--------|------------------------------|
| **I. Arquitetura MVC Desacoplada** | ✅ PASS | PostgREST maps PostgreSQL schema to HTTP endpoints; Vue 3 frontend handles client View. |
| **II. Spec-Driven Development** | ✅ PASS | API contracts defined first. All entities map strictly to the specifications. |
| **III. Tipagem Estática no schema.ts** | ✅ PASS | CLI used to generate `schema.ts` from OpenAPI spec. No manual types for backend entities. |
| **IV. Código Limpo e Sem Comentários** | ✅ PASS | Code written cleanly and expressively, avoiding redundant inline comments. |
| **V. Cálculo Automatizado de Horas** | ✅ PASS | Conversions (Monitoria x2, Minicurso x3/x2.5, Marketing 2h/4h) calculated directly in DB views/triggers. |
| **VI. Privacidade Parametrizável** | ✅ PASS | DB queries/views enforce visibility of contact data conditional on status and setting. |
| **VII. Trava de Reuniões** | ✅ PASS | Trigger prevents planning meetings from accumulating certified hours. |
| **VIII. Registro Semanal Unificado** | ✅ PASS | Single API payload to PostgreSQL database handling child activity items. |

*Gate outcome: All checks pass. Ready to proceed to research and design.*

## Project Structure

### Documentation (this feature)

```text
specs/001-lampex-control-system/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Specification Quality Checklist
└── contracts/           # Phase 1 output (OpenAPI contract)
    └── openapi.json
```

### Source Code (repository root)

```text
db/
└── migrations/          # PostgreSQL database schema migrations (Aiven backend)
    ├── 001_init_schema.sql
    └── 002_triggers_and_rules.sql
src/
├── components/          # Reusable Vue components (Heatmap, Matrix)
├── pages/               # Vue views (Home, Dashboard, Auditoria, Login)
├── services/            # API client and CLI generated schema.ts
├── router/              # Vue Router navigation mapping
└── assets/              # Global styles and assets (index.css)
tests/
├── contract/            # PostgREST API schema compliance tests
└── integration/         # UI journey tests (Vitest)
```

**Structure Decision**: A single-repo layout containing the frontend Vue app in `src/` and database migration SQL scripts in `db/` to cleanly manage migrations alongside client-side code.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*(No violations detected. Structure aligns fully with the Constitution).*
