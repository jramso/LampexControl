# Implementation Plan: Migração para Cloudflare Pages Functions

**Branch**: `004-pages-functions-auth` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-pages-functions-auth/spec.md`

## Summary

Migração da arquitetura de autenticação serverless baseada em um Cloudflare Worker isolado para a arquitetura de **Cloudflare Pages Functions**. A rota de login será implementada no arquivo `/functions/api/auth/login.ts` no mesmo repositório do frontend Vue 3, facilitando a integração, o deploy unificado e o ambiente de simulação local.

---

## Technical Context

**Language/Version**: TypeScript 5.3+ / Cloudflare Pages Functions runtime (V8 isolates)

**Primary Dependencies**: `pg` (node-postgres) `^8.13.0`, Vue 3, Vue Router 4

**Storage**: PostgreSQL (Aiven)

**Testing**: Vitest 2

**Target Platform**: Cloudflare Pages (Functions)

**Project Type**: Web application (frontend + serverless API)

**Performance Goals**: Autenticação em menos de 1 segundo, travamento e redirecionamento de rotas em menos de 100ms.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Justification |
| :--- | :--- | :--- |
| **I. Arquitetura MVC Desacoplada** | **PASS** | A lógica do PostgREST é mantida; a camada serverless de login apenas substitui o Worker anterior de forma unificada no Pages. |
| **II. Spec-Driven Development** | **PASS** | O plano técnico e a especificação foram gerados antes da escrita de qualquer código. |
| **III. Tipagem Estática schema.ts** | **PASS** | Tipagem do banco é preservada. |
| **IV. Código Limpo** | **PASS** | Código será escrito sem comentários redundantes e de forma expressiva. |
| **V. Cálculo de Horas** | **PASS** | Nenhuma alteração no cálculo de horas. |
| **VI. Privacidade de Contatos** | **PASS** | Regras de LGPD das views de contato continuam ativas no PostgreSQL. |

---

## Project Structure

### Documentation (this feature)

```text
specs/004-pages-functions-auth/
├── plan.md              # This file
├── research.md          # Technical research and decisions
├── data-model.md        # Relational models (no database changes)
├── quickstart.md        # Validation scenarios and setup
└── contracts/
    └── auth-endpoints.md # API endpoint contract
```

### Source Code (repository root)

```text
functions/
└── api/
    └── auth/
        └── login.ts     # Pages Function de autenticação

src/
├── components/
├── pages/
│   └── Login.vue        # Componente de Login (consumindo caminho relativo)
├── router/
│   └── index.ts         # Vue Router com guards baseados no JWT decodificado
└── services/
    ├── apiClient.ts     # PostgREST Client
    └── schema.ts        # Tipagem gerada automaticamente

tests/
├── integration/
│   ├── us1_auth_flow.test.ts
│   └── us2_route_guards.test.ts
└── unit/
```

**Structure Decision**: A estrutura segue a **Option 2 (Web Application)** com a inclusão do diretório `/functions` na raiz do repositório para hospedar as funções serverless nativas do Cloudflare Pages.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*(Nenhuma violação aos princípios constitucionais detectada)*
