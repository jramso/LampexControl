# Implementation Plan: Governança de Ações de Extensão

**Branch**: `004-extension-governance` | **Date**: 2026-07-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-extension-governance/spec.md`

## Summary

Implementação da transição do ecossistema LampexControl para uma plataforma de governança unificada de Ações de Extensão. O desenvolvimento abrange a criação da tabela `acao_extensao` no banco de dados da Aiven e a atualização do modelo relacional para associar voluntários (`usuario`) e registros de presença (`registro_atendimento`) a ações específicas. O fluxo de validação da Monitoria Rápida será otimizado no backend para verificar os 4 últimos dígitos da matrícula de forma robusta e validar a `senha_sessao` ativa de professores. No frontend, reestruturaremos o formulário `MonitoriaRapida.vue` para selecionar dinamicamente ações de extensão e filtrar voluntários, adaptaremos os relatórios de produtividade (`ReportsPanel.vue` e `AuditPanel.vue`) para agrupar métricas por Ação de Extensão, e utilizaremos a ferramenta de atribuição de cargo de gestor temporário em `ManagerDashboard.vue`.

## Technical Context

**Language/Version**: TypeScript 5.4+ / Node 20+

**Primary Dependencies**: `pg` (node-postgres v8.13+), `@supabase/postgrest-js` (comunicação frontend-backend), `vue-router`, `vue 3`

**Storage**: PostgreSQL (Aiven) + Cloudflare Hyperdrive

**Testing**: Validação ponta a ponta local baseada nos cenários descritos em `quickstart.md`.

**Target Platform**: Cloudflare Workers (Backend) & Cloudflare Pages (Frontend)

**Project Type**: Web Application + Web Service (desacoplados)

**Performance Goals**: Tempo de resposta de registro < 500ms.

**Constraints**: Comunicação via HTTPS, CORS habilitado em todas as rotas da API, restrição de acesso a relatórios e gestão de equipe a roles com privilégio administrativo (`gestor_fixo` e `gestor_temporario`).

**Scale/Scope**: Tabela de ações operando inicialmente com ~5 registros ativos. Fila de auditoria processando cerca de ~50 submissões/semana.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Princípio I (Desacoplamento)**: Frontend (`/lampex-control`) e API (`/lampex-control-api`) permanecem independentes e comunicam-se estritamente por requisições HTTPS. (PASSED)
- **Princípio II (Banco PostgreSQL)**: Toda a persistência é centralizada no Postgres da Aiven com SSL obrigatório. (PASSED)
- **Princípio III (Modelo de Autenticação)**: As credenciais e papéis continuam centralizados na tabela `usuario` (antiga `monitor`), estendendo as roles permitidas (`voluntario`, `professor`, `gestor_fixo`, `gestor_temporario`). (PASSED)
- **Princípio IV (Administrador Root)**: O perfil administrativo root de Josué Ramos Souza continua ativo no banco de dados. (PASSED)
- **Princípio V (Free-Tier)**: Não há custos de hospedagem VPS ou infraestrutura paga; todos os serviços usam planos gratuitos da Cloudflare e Aiven. (PASSED)
- **Segurança (CORS)**: A API do Workers continua tratando requisições de preflight `OPTIONS` e retornando os headers CORS adequados. (PASSED)

## Project Structure

### Documentation (this feature)

```text
specs/004-extension-governance/
├── plan.md              # Este arquivo (Implementation Plan)
├── research.md          # Log de decisões de design e alternativas
├── data-model.md        # Modelagem de dados e script de migração SQL
├── quickstart.md        # Guia de validação end-to-end do fluxo
└── contracts/
    └── extension-contracts.md # Contratos de endpoints request/response
```

### Source Code (repository root)

```text
lampex-control/             # Subprojeto Frontend (Vue 3 / Vite)
├── src/
│   ├── pages/
│   │   ├── MonitoriaRapida.vue     # Formulário com seletores dinâmicos e campo de senha condicional
│   │   └── ManagerDashboard.vue    # Painel administrativo com aba de gestão de cargos
│   ├── components/
│   │   ├── ReportsPanel.vue        # Painel de relatórios agrupados por Ação de Extensão
│   │   └── AuditPanel.vue          # Fila de auditoria exibindo metadados da ação
│   └── services/
│       └── apiService.ts           # Integração com os novos endpoints da API

lampex-control-api/         # Subprojeto Backend (Cloudflare Workers)
├── src/
│   └── index.ts            # Tratamento de endpoints, queries SQL com Hyperdrive e validações
```

**Structure Decision**: Mantemos a estrutura monorepo desacoplada. Toda a lógica de associação, filtragem e segurança reside na API do Worker e no banco Postgres, enquanto a reatividade das telas consome a API de forma assíncrona.

## Complexity Tracking

Nenhuma complexidade adicional ou desvio de governança introduzido. O plano adere integralmente aos princípios do projeto.
