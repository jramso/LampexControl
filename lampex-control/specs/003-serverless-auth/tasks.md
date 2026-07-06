# Tasks: Autenticação Serverless e Proteção de Rotas

**Input**: Design documents from `/specs/003-serverless-auth/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/auth-endpoints.md, quickstart.md

**Tests**: Tests are included to validate the Worker login responses and Vue Router guards.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização da estrutura de arquivos do Worker serverless e Docker local.

- [X] T001 Inicializar subdiretório worker/ e criar worker/package.json com dependências básicas
- [X] T002 [P] Criar arquivo de configuração do Cloudflare em worker/wrangler.toml
- [X] T003 [P] Criar configurações locais de containers em docker-compose.yml e worker/Dockerfile

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Prerrequisitos que bloqueiam a validação das histórias de usuário.

**⚠️ CRITICAL**: Nenhuma tarefa das histórias de usuário pode começar até que esta fase esteja completa.

- [X] T004 Configurar banco de dados local com pgcrypto e tabelas de testes
- [X] T005 Configurar segredos JWT e portas de simulação locais

**Checkpoint**: Ambiente local pronto para execução do mock serverless.

---

## Phase 3: User Story 1 - Autenticação Segura de Gestores (Priority: P1) 🎯 MVP

**Goal**: Permitir login na rota /api/auth/login emitindo o token JWT assinado para o gestor.

**Independent Test**: Realizar login de gestor com sucesso e recuperar token JWT contendo role "gestor".

### Tests for User Story 1
- [X] T006 [P] [US1] Criar teste de integração para fluxo de login serverless em tests/integration/us1_auth_flow.test.ts

### Implementation for User Story 1
- [X] T007 [US1] Implementar rota de login com verificação crypt no banco em worker/src/index.ts
- [X] T008 [US1] Atualizar formulário de login em src/pages/Login.vue para enviar dados ao worker e salvar token no localStorage

**Checkpoint**: Fluxo de autenticação de usuários completo e token JWT persistido localmente.

---

## Phase 4: User Story 2 - Proteção de Rotas e Telas Administrativas (Priority: P1) 🎯 MVP

**Goal**: Bloquear acessos ao painel ManagerDashboard.vue para quem não possui role "gestor".

**Independent Test**: Acessar rotas administrativas com role "monitor" ou deslogado e verificar o bloqueio.

### Tests for User Story 2
- [X] T009 [P] [US2] Criar teste de roteamento de rotas em tests/integration/us2_route_guards.test.ts

### Implementation for User Story 2
- [X] T010 [US2] Atualizar o roteador em src/router/index.ts adicionando travas para checar a role do token decodificado

**Checkpoint**: Travas de rotas ativas no Vue Router bloqueando acessos indevidos.

---

## Phase 5: User Story 3 - Simulação Local Serverless (Priority: P2)

**Goal**: Disponibilizar o ambiente de simulação Docker com um único comando.

**Independent Test**: Subir containers e autenticar localmente contra a porta do Worker local.

### Implementation for User Story 3
- [X] T011 [US3] Validar e orquestrar a execução local e conectividade no banco via docker-compose.yml

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes finos de documentação e testes finais.

- [X] T012 [P] Documentar comandos de execução local e chaves no arquivo worker/README.md
- [X] T013 Executar cenários de validação rápida definidos em specs/003-serverless-auth/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Sem dependências.
- **Phase 2 (Foundational)**: Depende do Setup. Bloqueia a implementação das histórias.
- **Phase 3 (User Story 1)**: Depende da Phase 2.
- **Phase 4 (User Story 2)**: Depende da Phase 3 (requer o token).
- **Phase 5 (User Story 3)**: Depende da Phase 1.
- **Phase N (Polish)**: Depende de todas as fases de histórias.

### Parallel Opportunities
- As tarefas de configuração `T002` e `T003` podem rodar em paralelo.
- Os testes integrados `T006` e `T009` podem ser desenvolvidos de forma paralela.

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)
1. Concluir Setup e Foundational (Phase 1 e 2).
2. Desenvolver a autenticação de login na rota (Phase 3).
3. Desenvolver os Guards de rotas (Phase 4).
4. **Validar MVP**: Login e proteção de rotas integrados no Vue 3.
