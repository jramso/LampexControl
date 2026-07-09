# Implementation Plan: Validação de Atendimentos via QR Code

**Branch**: `002-attendance-qr-validation` | **Date**: 2026-07-08 | **Spec**: [spec.md](file:///C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/specs/002-attendance-qr-validation/spec.md)

**Input**: Feature specification from `/specs/002-attendance-qr-validation/spec.md`

## Summary

Implementação ponta a ponta do fluxo de validação de atendimentos via QR Code. O desenvolvimento envolve a criação da tabela `registro_atendimento` no banco de dados e endpoints correspondentes no backend (/lampex-control-api), além da criação da rota pública `/atendimento-rapido` e da aba de relatórios no painel de gestão no frontend (/lampex-control). A persistência armazenará os dados de atendimentos preenchidos pelos alunos e as APIs agregadas retornarão as somas de horas para monitores (aplicando o fator de planejamento 2x) e alunos (horas brutas reais).

## Technical Context

**Language/Version**: TypeScript 5.4+ / Node 20+

**Primary Dependencies**: `pg` (node-postgres v8.13+), `@supabase/postgrest-js` (para comunicação no client do frontend), `vue-router` (para mapeamento de rotas), `vue 3`

**Storage**: PostgreSQL (Aiven) + Cloudflare Hyperdrive

**Testing**: Validação ponta a ponta via cenários de teste manuais descritos em [quickstart.md](file:///C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/specs/002-attendance-qr-validation/quickstart.md) e automotivos via scripts de consulta no backend.

**Target Platform**: Cloudflare Workers (Backend) & Cloudflare Pages (Frontend)

**Project Type**: Web Application + Web Service (desacoplados)

**Performance Goals**: Tempo de resposta de requisições de relatório < 500ms, carregamento e renderização de tabelas < 1s.

**Constraints**: Comunicação via HTTPS, cabeçalhos de CORS obrigatórios anexados pelo Cloudflare Worker, restrição de acesso a relatórios via JWT com a role de `'gestor'`.

**Scale/Scope**: Tabela de atendimento operando com carga estimada de ~1000 registros/mês.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Princípio I (Desacoplamento)**: Frontend (`/lampex-control`) e API (`/lampex-control-api`) comunicam-se de forma estritamente desacoplada via HTTPS. (PASSED)
- **Princípio II (Banco PostgreSQL)**: Toda a persistência é centralizada na instância PostgreSQL da Aiven via Hyperdrive ou conexão SSL obrigatória. (PASSED)
- **Princípio III (Modelo de Autenticação)**: O acesso às rotas de relatórios é controlado via token JWT baseado na tabela `monitor` com validação de role `'gestor'`. (PASSED)
- **Princípio IV (Administrador Root)**: O acesso administrativo do gestor do painel segue as permissões para o email padrão `josue.rsou2@gmail.com`. (PASSED)
- **Princípio V (Free-Tier)**: Não há servidores VPS ou recursos pagos. A infraestrutura rodará inteiramente nos planos gratuitos da Cloudflare e Aiven. (PASSED)
- **Segurança (CORS)**: Todas as rotas (incluindo o endpoint público de registrar e os endpoints de relatórios) tratam requisições `OPTIONS` e anexam cabeçalhos CORS adequados. (PASSED)

## Project Structure

### Documentation (this feature)

```text
specs/002-attendance-qr-validation/
├── plan.md              # Este arquivo (Implementation Plan)
├── research.md          # Log de decisões técnicas e alternativas
├── data-model.md        # Modelagem de banco de dados e diagrama de estados
├── quickstart.md        # Guia de validação end-to-end do fluxo
├── contracts/
│   └── attendance-api.md # Contratos de endpoints request/response
└── checklists/
    └── requirements.md  # Checklist de qualidade da especificação
```

### Source Code (repository root)

```text
lampex-control/             # Subprojeto Frontend (Vue 3 / Vite)
├── src/
│   ├── pages/
│   │   ├── MonitoriaRapida.vue     # Nova view pública do formulário
│   │   └── ManagerDashboard.vue    # Atualizado com aba "Relatórios" e tabelas
│   └── router/
│       └── index.ts                # Atualizado com a rota /atendimento-rapido
└── db/
    └── migrations/
        └── 008_attendance_validation_qr.sql  # Nova migração para criar registro_atendimento

lampex-control-api/         # Subprojeto Backend (Cloudflare Workers)
├── src/
│   └── index.ts            # Atualizado com endpoints de registro e relatórios
```

**Structure Decision**: Monorepo composto por dois subprojetos desacoplados com deploy independente (Pages e Workers). Os relatórios são gerados dinamicamente no backend via agregação SQL e protegidos por JWT.

## Complexity Tracking

Nenhuma violação de complexidade ou quebra de governança identificada. A funcionalidade adere integralmente aos princípios da constituição.
