# Tasks: Migração para Cloudflare Pages Functions

**Input**: Design documents from `/specs/004-pages-functions-auth/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização da estrutura de arquivos das Pages Functions.

- [X] T001 Criar estrutura física do diretório de rotas em functions/api/auth/
- [X] T002 [P] Atualizar as dependências no package.json principal garantindo pg ^8.13.0 e @types/pg ^8.11.0

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Prerrequisitos de configuração ambiental que bloqueiam a simulação local.

**⚠️ CRITICAL**: Nenhuma tarefa das histórias de usuário pode começar até que esta fase esteja completa.

- [X] T003 Configurar o arquivo de credenciais local .dev.vars na raiz do projeto
- [X] T004 [P] Validar a consistência dos segredos DATABASE_URL e JWT_SECRET no painel do Cloudflare Pages

**Checkpoint**: Ambiente de variáveis de ambiente pronto para simulação local do Pages.

---

## Phase 3: User Story 1 - Login Serverless via Pages Functions (Priority: P1) 🎯 MVP

**Goal**: Validar credenciais no banco Aiven e retornar o token JWT assinado na rota relativa /api/auth/login.

**Independent Test**: Fazer uma requisição POST direta para /api/auth/login com as credenciais do gestor e validar o retorno de um token JWT válido.

### Tests for User Story 1
- [X] T005 [P] [US1] Criar teste de integração para o fluxo de login em tests/integration/us1_pages_auth.test.ts

### Implementation for User Story 1
- [X] T006 [US1] Implementar a função de login serverless conectando ao banco no arquivo functions/api/auth/login.ts

**Checkpoint**: Endpoint de login do Pages Functions testado e gerando JWTs válidos.

---

## Phase 4: User Story 2 - Integração Relativa do Frontend e Travas de Rota (Priority: P1) 🎯 MVP

**Goal**: Chamar o endpoint relativo no Login.vue e assegurar a restrição de gestor no Vue Router.

**Independent Test**: Fazer login como monitor e testar o bloqueio ao tentar digitar na URL a rota /dashboard.

### Tests for User Story 2
- [X] T007 [P] [US2] Criar teste de roteamento e guards no frontend em tests/integration/us2_pages_route_guards.test.ts

### Implementation for User Story 2
- [X] T008 [US2] Atualizar a chamada do fetch para a rota relativa /api/auth/login no componente src/pages/Login.vue
- [X] T009 [US2] Ajustar o decodificador de JWT e o guard de navegação no arquivo src/router/index.ts

**Checkpoint**: Fluxo de autenticação e proteção de rotas integrados no frontend com caminhos relativos.

---

## Phase 5: User Story 3 - Ambiente de Simulação Local Integrado (Priority: P2)

**Goal**: Rodar o emulador do Pages Dev integrado e proxyando o servidor do Vite.

**Independent Test**: Executar a simulação unificada local e realizar login completo na porta 8788.

### Implementation for User Story 3
- [X] T010 [US3] Configurar comandos rápidos de desenvolvimento com proxy do Pages no arquivo package.json

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Limpeza de código legado e documentação dos novos procedimentos.

- [X] T011 [P] Remover a pasta antiga worker/ e referências ao wrangler.toml legado na raiz
- [X] T012 [P] Atualizar a documentação de execução local no arquivo README.md
- [X] T013 Executar o roteiro de validação integrada descrito em specs/004-pages-functions-auth/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Sem dependências.
- **Phase 2 (Foundational)**: Depende do Setup (Phase 1).
- **Phase 3 (User Story 1)**: Depende da Phase 2.
- **Phase 4 (User Story 2)**: Depende da Phase 3 (requer o endpoint).
- **Phase 5 (User Story 3)**: Depende da Phase 1.
- **Phase N (Polish)**: Depende de todas as fases de histórias.

### Parallel Opportunities
- As tarefas marcadas com `[P]` em todas as fases podem rodar em paralelo.
- Os testes integrados `T005` e `T007` podem ser criados de forma paralela.

---

## Parallel Example: User Story 1 & 2 Tests

```bash
# Executar a escrita de testes em paralelo
Task: "Criar teste de integração para o fluxo de login em tests/integration/us1_pages_auth.test.ts"
Task: "Criar teste de roteamento e guards no frontend em tests/integration/us2_pages_route_guards.test.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)
1. Concluir Setup e Foundational (Phase 1 e 2).
2. Criar a rota de API em `/functions/api/auth/login.ts` (Phase 3).
3. Atualizar a tela de login e o roteador (Phase 4).
4. **Validar MVP**: Garantir login funcional e guards de rotas protegendo o painel administratvo.
