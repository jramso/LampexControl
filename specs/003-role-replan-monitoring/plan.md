# Implementation Plan: Replanejamento de Cargos e Monitoria com Professor

**Branch**: `003-role-replan-monitoring` | **Date**: 2026-07-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-role-replan-monitoring/spec.md`

## Summary

Implementação ponta a ponta do replanejamento de cargos e do fluxo de monitoria com professor. O desenvolvimento envolve a atualização da constraint `CHECK` de roles na tabela `monitor` (`voluntario`, `professor`, `gestor_fixo`, `gestor_temporario`), a criação da tabela `monitoria_professor` para armazenar as senhas diárias de aulas, e a modificação do endpoint `POST /api/atendimentos/registrar` para forçar a validação de matrícula do monitor e a conferência de senha ativa da aula para a modalidade "Presencial com Professor". No frontend, injetamos campos em `MonitoriaRapida.vue`, adicionamos a ferramenta de promoção de Bruno Gestor e Emmanuel Gestor no `ManagerDashboard.vue`, e criamos a seção de gerenciamento de aulas de professor no `MonitorProfile.vue`.

## Technical Context

**Language/Version**: TypeScript 5.4+ / Node 20+

**Primary Dependencies**: `pg` (node-postgres v8.13+), `@supabase/postgrest-js` (comunicação frontend-backend), `vue-router` (roteamento), `vue 3`

**Storage**: PostgreSQL (Aiven) + Cloudflare Hyperdrive

**Testing**: Validação ponta a ponta via cenários de teste manuais descritos em `quickstart.md`.

**Target Platform**: Cloudflare Workers (Backend) & Cloudflare Pages (Frontend)

**Project Type**: Web Application + Web Service (desacoplados)

**Performance Goals**: Tempo de resposta do endpoint de registro < 500ms.

**Constraints**: Comunicação via HTTPS, cabeçalhos de CORS obrigatórios, restrição de rotas de auditoria e relatórios via JWT para roles com permissão de gestão (`gestor_fixo` e `gestor_temporario`), e segurança nos endpoints de aulas do professor.

**Scale/Scope**: Tabela de monitor operando com ~20 registros. Tabela de monitoria_professor operando com ~100 registros/mês.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Princípio I (Desacoplamento)**: Frontend (`/lampex-control`) e API (`/lampex-control-api`) comunicam-se de forma estritamente desacoplada via HTTPS. (PASSED)
- **Princípio II (Banco PostgreSQL)**: Toda a persistência é centralizada na instância PostgreSQL da Aiven via Hyperdrive ou conexão SSL obrigatória. (PASSED)
- **Princípio III (Modelo de Autenticação)**: O acesso e a autenticação continuam estritamente centralizados na tabela `monitor`. A coluna `role` aceita agora apenas os quatro valores especificados, mantendo a autenticação centralizada e sem criar tabelas genéricas de usuário. (PASSED)
- **Princípio IV (Administrador Root)**: O administrador root e gestor padrão (Josué) continua ativo com o e-mail padrão `josue.rsou2@gmail.com` e sua role será migrada para `gestor_fixo`. (PASSED)
- **Princípio V (Free-Tier)**: Não há servidores VPS ou recursos pagos. A infraestrutura rodará inteiramente nos planos gratuitos da Cloudflare e Aiven. (PASSED)
- **Segurança (CORS)**: Todas as rotas tratam requisições `OPTIONS` e anexam cabeçalhos CORS adequados. (PASSED)

## Project Structure

### Documentation (this feature)

```text
specs/003-role-replan-monitoring/
├── plan.md              # Este arquivo (Implementation Plan)
├── research.md          # Log de decisões técnicas e alternativas
├── data-model.md        # Modelagem de banco de dados e migrações
├── quickstart.md        # Guia de validação end-to-end do fluxo
└── contracts/
    └── role-contracts.md # Contratos de endpoints request/response
```

### Source Code (repository root)

```text
lampex-control/             # Subprojeto Frontend (Vue 3 / Vite)
├── src/
│   ├── pages/
│   │   ├── MonitoriaRapida.vue     # Formulário com campo de código e senha condicional
│   │   ├── MonitorProfile.vue      # Painel de perfil + painel de gerenciamento de aulas do professor
│   │   └── ManagerDashboard.vue    # Atualizado com a ferramenta de promoção de Bruno Gestor e Emmanuel Gestor
└── db/
    └── migrations/
        └── 010_role_replan_monitoring.sql  # Nova migração alterando restrições de tabelas e criando monitoria_professor

lampex-control-api/         # Subprojeto Backend (Cloudflare Workers)
├── src/
│   └── index.ts            # Endpoints de registro, criação/fechamento de aulas, e nova lógica de JWT/roles
```

**Structure Decision**: Mantemos a arquitetura monorepo desacoplada. Toda a persistência de regras de negócio de roles e aulas é centralizada no Postgres e exposta de forma segura pela API do Worker.

## Complexity Tracking

Nenhuma violação de complexidade ou quebra de governança identificada. A funcionalidade adere integralmente aos princípios da constituição.
