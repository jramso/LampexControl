# Implementation Plan: Autenticação Serverless e Proteção de Rotas

**Branch**: `003-serverless-auth` | **Date**: 2026-07-06 | **Spec**: [spec.md](file:///C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/lampex-control/specs/003-serverless-auth/spec.md)

**Input**: Feature specification from `/specs/003-serverless-auth/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Esta feature implementa o sistema de autenticação segura para o LampexControl, utilizando uma arquitetura serverless no Cloudflare Workers integrada com o banco de dados PostgreSQL na Aiven (e simulada localmente via Docker). No lado do cliente, o Vue Router é configurado com route guards para validar perfis e proteger o painel gestor de acessos não autorizados.

## Technical Context

**Language/Version**: TypeScript 5.x, PL/pgSQL (PostgreSQL 15+), Node 22

**Primary Dependencies**: `wrangler` (Cloudflare Workers CLI), `@cloudflare/workers-types`, `jose` (JWT signing/verifying), `pg` (PostgreSQL client)

**Storage**: PostgreSQL (Aiven cloud hosting) + Local PostgreSQL Docker container

**Testing**: Vitest (integration/unit tests)

**Target Platform**: Cloudflare Workers runtime (V8 serverless) + Modern Web Browsers (Chrome, Edge, Safari, Firefox)

**Project Type**: Decoupled Web Application & Serverless API Service

**Performance Goals**: Autenticação e assinatura de token em menos de 1.5s (SC-002)

**Constraints**:
* Limitações de tempo de execução e CPU de Cloudflare Workers (<50ms de CPU por request).
* Utilização de conexões seguras TCP via sockets do Cloudflare (`cloudflare:sockets`) para o banco de dados.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Status | Alignment & Execution Details |
| :--- | :--- | :--- |
| **I. Arquitetura MVC Desacoplada** | ✅ PASS | Camada de visualização (Vue 3) desacoplada do controlador de autenticação (Cloudflare Workers) e modelo de dados (PostgreSQL). |
| **II. Spec-Driven Development** | ✅ PASS | Contratos de API descritos na especificação e implementados em conformidade estrita com o OpenAPI. |
| **III. Tipagem Estática no schema.ts** | ✅ PASS | Tipos TypeScript utilizados de forma consistente para payloads e estruturas de dados de banco. |
| **IV. Código Limpo e Sem Comentários** | ✅ PASS | Implementação modular, sem redundância de comentários de código nos arquivos novos. |

## Project Structure

### Documentation (this feature)

```text
specs/003-serverless-auth/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Specification Quality Checklist
└── contracts/           # Phase 1 output (OpenAPI contract)
    └── auth-endpoints.md
```

### Source Code (repository root)

```text
worker/                  # Novo subdiretório contendo o Cloudflare Worker
├── src/
│   └── index.ts         # Código do Worker (validação crypt e geração de JWT)
├── wrangler.toml        # Arquivo de configuração Wrangler / Cloudflare
├── Dockerfile           # Dockerfile para simulação do worker localmente
└── package.json         # Dependências do worker
docker-compose.yml       # Orquestração local do PostgreSQL local + Worker emulação
src/
├── router/
│   └── index.ts         # Ajustado com guards para checagem de role gestor/monitor
└── pages/
    └── Login.vue        # Conectado ao novo endpoint /api/auth/login e localStorage
```

**Structure Decision**: A criação da pasta `worker/` na raiz separa a lógica de execução serverless do Cloudflare, enquanto o arquivo `docker-compose.yml` orquestra a execução simultânea do banco e emulador localmente.

## Complexity Tracking

*(Nenhuma violação aos princípios constitucionais foi identificada).*
