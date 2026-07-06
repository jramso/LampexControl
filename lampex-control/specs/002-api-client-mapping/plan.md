# Implementation Plan: Mapeamento de Chamados da API

**Branch**: `[002-api-client-mapping]` | **Date**: 2026-07-06 | **Spec**: [spec.md](file:///C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/lampex-control/specs/002-api-client-mapping/spec.md)

**Input**: Feature specification from `/specs/002-api-client-mapping/spec.md`

---

## Summary
A integração da API no LampexControl é realizada diretamente entre o cliente TypeScript do frontend e o barramento do PostgREST. Esse plano mapeia as requisições de criação de chamados, submissões transacionais de relatórios semanais com múltiplas atividades e consultas a views analíticas de planejamento de reuniões (heatmap) e contato seguro dos monitores.

---

## Technical Context

**Language/Version**: TypeScript, Node 22, Vue 3.5

**Primary Dependencies**: `@supabase/postgrest-js`, `vue-router`, `openapi-typescript`

**Storage**: PostgreSQL (Aiven) + PostgREST

**Testing**: Vitest, pgTAP

**Target Platform**: Web Browser (Chrome, Firefox, Safari)

**Project Type**: Single project (Vite / Vue 3 SPA + PostgreSQL migration scripts)

**Performance Goals**: Latência das requisições e carregamento de dados < 2,0 segundos sob condições normais de uso do laboratório.

**Constraints**:
* Coleta de dados sensíveis dos alunos (CPF e data de nascimento) protegida segundo a LGPD.
* Rate limiting preventivo ativado a nível de banco nas rotas de login e chamados públicos.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Princípio I: MVC Desacoplado**: Totalmente alinhado. O cliente `@supabase/postgrest-js` faz o consumo direto dos endpoints gerados a partir do esquema do PostgreSQL.
- **Princípio II: Spec-Driven**: Totalmente alinhado. O design e o contrato dos endpoints foram detalhados nas especificações e no plano antes de qualquer alteração de código.
- **Princípio III: Tipagem Estática**: Totalmente alinhado. Os esquemas e assinaturas TypeScript são gerados automaticamente a partir do contrato OpenAPI no arquivo `schema.ts`.
- **Princípio IV: Código Limpo**: Totalmente alinhado. Todo o código escrito é autoexplicativo, limpo e livre de comentários redundantes.
- **Princípio V: Cálculo de Pesos**: Totalmente alinhado. As horas líquidas das atividades são calculadas de forma automatizada no banco de dados.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-api-client-mapping/
├── spec.md              # Feature specification
├── plan.md              # This file (Implementation Plan)
├── research.md          # Technical research & decisions
├── quickstart.md        # Validation scenarios
├── checklists/
│   └── requirements.md  # Quality checklist requirements
└── contracts/
    └── client-endpoints.md # PostgREST OpenAPI mapping
```

### Source Code (repository root)

```text
src/
├── services/
│   ├── apiClient.ts     # Client PostgREST
│   ├── schema.ts        # Tipos auto-gerados da API
│   └── srcExport.ts     # Exportador de dados para o SRC
├── router/
│   └── index.ts         # Roteamento e Guards de acesso
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

**Structure Decision**: Utilizado a estrutura de **Single Project** contendo o frontend Vue e os serviços de integração no mesmo diretório, organizados por componentes e páginas reutilizáveis.

---

## Complexity Tracking

*Nenhuma violação aos princípios da constituição foi identificada. O design técnico respeita todas as regras e diretrizes estabelecidas.*
