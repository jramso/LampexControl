# Implementation Plan: Mapeamento de Chamados da API

**Branch**: `002-api-client-mapping` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-api-client-mapping/spec.md`

---

## Summary
A integração da API no LampexControl é migrada de uma arquitetura baseada no PostgREST direto no frontend para uma arquitetura totalmente serverless baseada em **Cloudflare Pages Functions**. O cliente do frontend é reimplementado em TypeScript utilizando a biblioteca **Axios** para chamadas às rotas do Pages (prefixo `/api/*`), enquanto o backend serverless utiliza a biblioteca **postgres** (postgres.js) para conectar diretamente ao banco PostgreSQL na Aiven.

---

## Technical Context

**Language/Version**: TypeScript 5.3+, Node 22+, Vue 3.5

**Primary Dependencies**: `axios` ^1.7.0, `postgres` ^3.4.0 (backend serverless), `vue-router`

**Storage**: PostgreSQL (Aiven)

**Testing**: Vitest ^2.0.0

**Target Platform**: Cloudflare Pages (Functions edge runtime / V8 isolates)

**Project Type**: Web application (frontend Vue + serverless API functions)

**Performance Goals**: Latência das rotas no Edge < 1,0 segundo e carregamento de views em < 1,5 segundos.

**Constraints**:
* Coleta de dados de alunos e monitores protegida segundo as normas da LGPD.
* Limitação estrita do pool de conexões com o banco (`max: 1` ou `max: 2`) no escopo global das funções para evitar exaustão de conexões no PostgreSQL.
* Repasse do contexto de claims do JWT de sessão para o banco PostgreSQL a cada chamada executada pelas Pages Functions.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check post-design.*

| Principle | Status | Justification / Complexity Tracking |
| :--- | :--- | :--- |
| **I. Arquitetura MVC Desacoplada** | **VIOLATION (Justified)** | Migração do barramento PostgREST para Cloudflare Pages Functions utilizando a biblioteca `postgres` para comunicação direta com o banco relacional. Justificado abaixo no Complexity Tracking. |
| **II. Spec-Driven Development** | **PASS** | Todas as alterações de endpoints, comportamento e modelagem foram especificadas e acordadas no spec.md e contratos. |
| **III. Tipagem Estática schema.ts** | **VIOLATION (Justified)** | A geração de tipos automática a partir de OpenAPI/PostgREST foi substituída por interfaces TypeScript compartilhadas em `src/services/types.ts`. Justificado abaixo. |
| **IV. Código Limpo** | **PASS** | Código implementado de forma limpa, autoexplicativa e livre de comentários redundantes. |
| **V. Cálculo Automatizado de Horas** | **PASS** | Toda a regra de pesos e cálculo de horas líquidas permanece residindo no banco de dados por meio de triggers e procedures. |
| **VI. Privacidade Parametrizável** | **PASS** | A view de privacidade `view_contato_monitor` continua sendo o ponto central de controle LGPD, com claims de sessão ativadas em SQL pelas Functions. |
| **VII. Trava de Segurança** | **PASS** | Validações de auditoria mantidas. |
| **VIII. Fluxo Unificado** | **PASS** | Múltiplas atividades salvas atomicamente em transação única. |

---

## Project Structure

### Documentation (this feature)

```text
specs/002-api-client-mapping/
├── spec.md              # Feature specification
├── plan.md              # This file (Implementation Plan)
├── research.md          # Technical research & decisions (Phase 0)
├── quickstart.md        # Validation scenarios (Phase 1)
├── checklists/
│   └── requirements.md  # Quality checklist requirements
└── contracts/
    └── client-endpoints.md # API Endpoints Contract (Phase 1)
```

### Source Code (repository root)

```text
functions/
└── api/
    ├── solicitacoes_monitoria.ts  # POST - Criação de chamados
    ├── registro_horas.ts         # POST - Registro de folha semanal (RPC)
    ├── view_reuniao_geral.ts      # GET - Heatmap de disponibilidade
    ├── view_contato_monitor.ts    # GET - Detalhes confidenciais do monitor
    └── [[path]].ts                # Roteador legível fallback de API
    
src/
├── services/
│   ├── apiClient.ts               # Cliente HTTP baseado no Axios
│   ├── types.ts                   # Interfaces de dados compartilhadas
│   └── srcExport.ts               # Exportador de dados para o SRC
├── router/
│   └── index.ts                   # Roteamento e Guards de acesso
├── components/
│   ├── TutoringRequestForm.vue
│   ├── AvailabilityMatrix.vue
│   ├── WeeklyReportForm.vue
│   ├── MeetingHeatmap.vue
│   └── AuditPanel.vue
└── pages/
    ├── Home.vue
    ├── RequestStatus.vue
    ├── Login.vue
    ├── MonitorProfile.vue
    ├── WeeklySubmission.vue
    └── ManagerDashboard.vue
```

**Structure Decision**: A estrutura unifica o frontend Vue e as funções do Cloudflare Pages na mesma árvore do repositório, hospedando as APIs serverless dentro da pasta `/functions` na raiz, e o consumo do lado do cliente em `src/services/apiClient.ts` com Axios.

---

## Complexity Tracking

> **Violations to the Constitution principles**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| :--- | :--- | :--- |
| **Princípio I (MVC com PostgREST)** | Troca do barramento PostgREST intermediário por Cloudflare Pages Functions para simplificar o ambiente local, unificar o deploy no Cloudflare Pages e obter controle transacional completo nas rotas. | Manter o PostgREST exigiria a gestão de uma infraestrutura extra ativa de middleware e limitaria a facilidade de desenvolvimento local simplificado integrado. |
| **Princípio III (Tipagem OpenAPI schema.ts)** | Sem o barramento OpenAPI exposto de forma pública pelo PostgREST, a geração automática foi substituída por um contrato compartilhado de tipos TypeScript declarados manualmente em `types.ts`. | Desenvolver um pipeline local complexo de geração automática de tipos a partir de arquivos SQL brutos traria enorme complexidade e overhead de build desnecessários. |
