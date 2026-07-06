# Feature Specification: Migração para Cloudflare Pages Functions

**Feature Branch**: `004-pages-functions-auth`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Quarta Spec do LampexControl focada na migração para a arquitetura de Cloudflare Pages Functions. Criar a estrutura de endpoints em TypeScript dentro do diretório /functions/api/ para rodar de forma serverless e integrada ao Cloudflare Pages. Implementar a rota /api/auth/login de forma que ela se conecte diretamente ao banco PostgreSQL na Aiven para validar o e-mail 'josue.rsou2@gmail.com' e a senha na tabela 'monitor' usando a extensão pgcrypto. Ajustar o componente Login.vue para consumir este endpoint relativo, persistir o JWT retornado e atualizar as travas do router/index.ts para garantir o acesso ao painel ManagerDashboard.vue apenas para usuários com a role 'gestor'."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Login Serverless via Pages Functions (Priority: P1) 🎯 MVP

O sistema deve processar a autenticação de membros de forma serverless usando Cloudflare Pages Functions. O endpoint deve estar localizado na rota `/api/auth/login` (mapeada no arquivo físico `/functions/api/auth/login.ts`), conectando-se diretamente ao PostgreSQL na Aiven para validar as credenciais do monitor/gestor.

**Why this priority**: É o pilar do MVP de autenticação serverless unificada, reduzindo custos e complexidade operacional ao integrar frontend e backend em um único repositório do Cloudflare Pages.

**Independent Test**: Fazer uma requisição POST direta para `/api/auth/login` com as credenciais do usuário `josue.rsou2@gmail.com` e a senha correta, e receber de volta um token JWT válido assinado.

**Acceptance Scenarios**:

1. **Given** que o usuário fornece um e-mail e senha corretos, **When** o endpoint `/api/auth/login` é acionado via POST, **Then** o sistema retorna HTTP 200 com o token JWT contendo as reivindicações do usuário (ID, e-mail e papel de acesso).
2. **Given** que o usuário fornece credenciais incorretas ou inexistentes no banco Aiven, **When** o endpoint é acionado, **Then** o sistema retorna HTTP 401 com a mensagem de erro apropriada.

---

### User Story 2 - Integração Relativa do Frontend e Travas de Rota (Priority: P1) 🎯 MVP

O formulário de login no componente `Login.vue` deve consumir o endpoint relativo `/api/auth/login` (sem prefixos absolutos de domínio) e salvar o token JWT no `localStorage`. As travas de rotas no `router/index.ts` devem ler e decodificar este token, restringindo o acesso à rota `/dashboard` (`ManagerDashboard.vue`) apenas se a role for `"gestor"`.

**Why this priority**: Garante que o cliente consuma a API local/produção de forma integrada sem necessidade de hardcode de URLs de backend, mantendo a proteção estrita de telas confidenciais.

**Independent Test**: Fazer login como monitor (`monitor@ifes.edu.br`), tentar acessar a rota `/dashboard` e verificar se o sistema bloqueia e redireciona automaticamente o monitor para o seu perfil.

**Acceptance Scenarios**:

1. **Given** que o usuário efetua login com sucesso como gestor, **When** ele é autenticado, **Then** o sistema armazena o token e permite que ele acesse a rota `/dashboard`.
2. **Given** que o usuário está autenticado com o papel de monitor, **When** ele tenta navegar diretamente para a rota `/dashboard`, **Then** o Vue Router bloqueia o acesso e o redireciona para a página `/perfil`.

---

### User Story 3 - Ambiente de Simulação Local Integrado (Priority: P2)

O desenvolvedor deve conseguir rodar o frontend e as Pages Functions localmente de forma unificada utilizando a CLI do Wrangler integrada ao Vite.

**Why this priority**: Aumenta a velocidade de desenvolvimento e garante paridade total de simulação local com o ambiente de produção do Cloudflare Pages.

**Independent Test**: Iniciar o ambiente de desenvolvimento local usando o Wrangler e efetuar o fluxo completo de login e navegação localmente contra o banco de dados.

**Acceptance Scenarios**:

1. **Given** o arquivo `.dev.vars` configurado localmente com as chaves do banco de dados, **When** o comando de simulação é executado, **Then** as rotas em `/functions/api/*` ficam ativas na mesma porta local do frontend.

---

### Edge Cases

- **Ausência de Conexão com o Banco**: Se o banco PostgreSQL Aiven estiver inacessível ou cair, o Pages Function de login deve retornar HTTP 500 informando falha de comunicação com o servidor, sem expor credenciais brutas ou stack traces sensíveis na resposta da API.
- **Tokens Adulterados ou Expirados**: Se um usuário alterar manualmente o papel de acesso no `localStorage` para tentar burlar a proteção, o Vue Router deve invalidar o acesso ao decodificar a assinatura criptografada e o tempo de expiração (`exp`) contidos no JWT real, limpando o armazenamento local e enviando o usuário para a tela de login.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O backend MUST expor o endpoint de autenticação no caminho relativo `/api/auth/login` por meio de Cloudflare Pages Functions em `/functions/api/auth/login.ts` (ou subdiretórios equivalentes de funções).
- **FR-002**: O Pages Function MUST ler as variáveis de ambiente `DATABASE_URL` e `JWT_SECRET` configuradas nos segredos do Cloudflare Pages e no arquivo local `.dev.vars`.
- **FR-003**: A validação da senha do usuário MUST ser feita diretamente no banco de dados comparando a senha informada com o hash salvo na tabela `monitor` usando a função `crypt` da extensão `pgcrypto`.
- **FR-004**: O token JWT gerado pelo Pages Function MUST ser assinado utilizando a Web Cryptography API nativa do runtime da Cloudflare (`crypto.subtle`), contendo as reivindicações `id`, `email`, `role` e `exp` (expiração de 24 horas).
- **FR-005**: O componente `Login.vue` MUST enviar as credenciais para o endpoint relativo `/api/auth/login` por meio de chamadas HTTP padrão (`fetch`).
- **FR-006**: O Vue Router (`router/index.ts`) MUST decodificar as reivindicações do JWT armazenado no `localStorage` antes de cada navegação e barrar o acesso à rota `/dashboard` se o papel não for exatamente `"gestor"`.

### Key Entities

- **monitor**: Representa o usuário do sistema (monitores e gestores) com atributos de identificação (`id`), autenticação (`email`, `senha_hash`) e nível de privilégios (`role`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das chamadas de API de login originadas pelo frontend Vue devem apontar para caminhos relativos ao domínio principal, sem hardcode de URLs absolutas.
- **SC-002**: O bloqueio e redirecionamento de usuários sem o papel `"gestor"` que tentem acessar a rota restrita `/dashboard` deve ocorrer em menos de 100ms na navegação do cliente.
- **SC-003**: O tempo de inicialização do emulador local do Pages (Vite + Wrangler Pages Functions) deve ser inferior a 3 segundos com um único comando de execução.

## Assumptions

- O desenvolvedor possui chaves válidas de acesso ao banco PostgreSQL na Aiven configuradas localmente.
- O Cloudflare Pages Functions usará a compatibilidade com APIs do Node.js (`nodejs_compat`) ativa no painel do Cloudflare Pages e nas flags locais do Wrangler.
