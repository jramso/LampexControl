# Implementation Plan: Fluxo de Triagem de Voluntários

**Branch**: `001-volunteer-screening` | **Date**: 2026-07-07 | **Spec**: [spec.md](file:///C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/specs/001-volunteer-screening/spec.md)

**Input**: Feature specification from `/specs/001-volunteer-screening/spec.md`

## Summary

Implementação ponta a ponta do Fluxo de Triagem de Voluntários. O desenvolvimento é dividido entre o backend em Cloudflare Workers (`/lampex-control-api`) e o frontend em Vue 3 (`/lampex-control`). No backend, criaremos a nova tabela `potencial_voluntario` no PostgreSQL e as APIs correspondentes para cadastro público, listagem de pendentes e aprovação/rejeição protegidas por JWT de gestor. No frontend, adicionaremos a tela pública de cadastro (`CadastroMonitor.vue`), integraremos a aba de "Triagem" no dashboard administrativo (`ManagerDashboard.vue`), e faremos a integração de rede via `fetch` consumindo os novos endpoints.

## Technical Context

**Language/Version**: TypeScript 5.4+ / Node 20+

**Primary Dependencies**: `pg` (node-postgres v8.13+), `@supabase/postgrest-js` (para comunicação genérica no client), `vue-router` (para novas rotas), `vue 3`

**Storage**: PostgreSQL (Aiven) + Cloudflare Hyperdrive

**Testing**: Validação ponta a ponta via cenários contidos no [quickstart.md](file:///C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/specs/001-volunteer-screening/quickstart.md)

**Target Platform**: Cloudflare Workers (Backend) & Cloudflare Pages (Frontend)

**Project Type**: Web Application + Web Service (desacoplados)

**Performance Goals**: Tempo de resposta de chamadas à API < 500ms, transições de interface instantâneas (< 1s)

**Constraints**: Comunicação estrita via HTTPS, tratamento manual de CORS no worker, autenticação via JWT com roles (monitor/gestor)

**Scale/Scope**: Tabela de triagem operando com ~100 registros simultâneos na fila de candidatos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Princípio I (Desacoplamento)**: A comunicação entre `/lampex-control` e `/lampex-control-api` ocorre estritamente por requisições HTTPS. (PASSED)
- **Princípio II (Banco PostgreSQL)**: Toda a persistência é centralizada no PostgreSQL da Aiven via Hyperdrive ou conexão SSL obrigatória. (PASSED)
- **Princípio III (Modelo de Autenticação)**: Usuários que entram no sistema são promovidos à tabela `monitor` com role `'monitor'`. Toda lógica de autenticação se mantém sobre a tabela `monitor`. (PASSED)
- **Princípio IV (Administrador Root)**: O acesso à aba de triagem e às APIs de aprovação é restrito à role `'gestor'`, testado com a credencial padrão de `josue.rsou2@gmail.com`. (PASSED)
- **Princípio V (Free-Tier)**: Não há uso de servidores VPS ou serviços pagos. Todo deploy e banco rodam nos planos gratuitos de Cloudflare e Aiven. (PASSED)
- **Segurança (CORS)**: Todas as novas rotas de API possuem cabeçalhos CORS anexados e tratam requisições `OPTIONS`. (PASSED)

## Project Structure

### Documentation (this feature)

```text
specs/001-volunteer-screening/
├── plan.md              # Este arquivo (Implementation Plan)
├── research.md          # Log de decisões técnicas e alternativas
├── data-model.md        # Modelagem de banco de dados e diagrama de estados
├── quickstart.md        # Guia de validação end-to-end do fluxo
├── contracts/
│   └── volunteer-api.md # Contratos de endpoints request/response
└── checklists/
    └── requirements.md  # Checklist de qualidade da especificação
```

### Source Code (repository root)

```text
lampex-control/             # Subprojeto Frontend (Vue 3 / Vite)
├── src/
│   ├── components/         # CadastroMonitor.vue, TriagemPanel.vue (novos)
│   ├── pages/              # ManagerDashboard.vue (atualizado para incluir a aba)
│   ├── services/           # apiService.ts (atualizado com chamadas de triagem)
│   └── router/             # index.ts (atualizado com a rota /cadastro)

lampex-control-api/         # Subprojeto Backend (Cloudflare Workers)
├── src/
│   └── index.ts            # Roteador customizado e queries SQL de triagem
```

**Structure Decision**: Monorepo composto por dois subprojetos isolados com deploy independente (Pages e Workers). Toda lógica de negócio de triagem é acionada por chamadas de rede do frontend para a API backend.

## Complexity Tracking

*Nenhuma violação de complexidade ou quebra de governança identificada. O fluxo de triagem respeita integralmente a arquitetura estabelecida.*
