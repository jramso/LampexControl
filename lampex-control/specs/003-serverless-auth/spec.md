# Feature Specification: Autenticação Serverless e Proteção de Rotas

**Feature Branch**: `003-serverless-auth`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "terceira Spec do LampexControl focada em Autenticação Serverless via Cloudflare Workers integrada com tabelas locais em Docker. Implementar um endpoint de login sob a rota /api/auth/login utilizando a tabela 'monitor' do PostgreSQL na Aiven. Se as credenciais coincidirem usando a validação crypt da pgcrypto, assinar um JWT contendo o papel de acesso 'gestor' do usuário 'josue.rsou2@gmail.com'. Conectar o formulário do componente Login.vue para persistir o token recebido no localStorage e ajustar as travas de rota em router/index.ts para bloquear acessos indevidos ao painel ManagerDashboard.vue caso o papel decodificado não seja 'gestor'. Fornecer os arquivos de configuração Dockerfile e docker-compose.yml para simulação local idêntica ao ambiente Cloudflare."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Autenticação Segura de Gestores (Priority: P1)

O gestor (como o usuário "josue.rsou2@gmail.com") deve conseguir realizar o login informando seu e-mail e senha no formulário do sistema, recebendo um token de autorização JWT assinado pelo worker serverless.

**Why this priority**: A autenticação é o pré-requisito de segurança principal que protege dados sensíveis sob a LGPD e identifica quem está executando ações de auditoria.

**Independent Test**: Enviar requisição POST para `/api/auth/login` com as credenciais corretas do gestor e confirmar o recebimento do token JWT com a role de "gestor".

**Acceptance Scenarios**:

1. **Given** que o usuário está na tela de login, **When** insere e-mail "josue.rsou2@gmail.com" e senha correta e clica em enviar, **Then** o sistema armazena o token no localStorage e redireciona para o painel de gerenciamento.
2. **Given** que o usuário insere credenciais incorretas, **When** clica em enviar, **Then** o sistema exibe uma mensagem amigável de erro de credenciais inválidas.

---

### User Story 2 - Proteção de Rotas e Telas Administrativas (Priority: P1)

O sistema deve verificar se o usuário está autenticado e possui o papel de "gestor" antes de permitir o acesso às telas administrativas e auditorias.

**Why this priority**: Evita escalação de privilégios de monitores ou acessos maliciosos de agentes externos que acessem as URLs diretamente.

**Independent Test**: Tentar acessar a rota `/gestor` com um usuário cuja role seja "monitor" e verificar se ocorre bloqueio imediato e redirecionamento.

**Acceptance Scenarios**:

1. **Given** que o usuário está logado com a role de "monitor", **When** tenta acessar `/gestor`, **Then** o roteador bloqueia o acesso e o redireciona para `/perfil`.
2. **Given** que o usuário não está autenticado, **When** tenta acessar `/gestor` ou `/perfil`, **Then** ele é redirecionado para a tela de `/login`.

---

### User Story 3 - Simulação Local Serverless (Priority: P2)

Desenvolvedores devem conseguir rodar e simular o fluxo completo de autenticação serverless de forma local usando containers Docker idênticos ao ambiente de produção.

**Why this priority**: Acelera o desenvolvimento local e validação de regras de banco integradas com o Cloudflare Workers sem dependência de conexões de internet ou publicação em nuvem.

**Independent Test**: Levantar os containers Docker locais e realizar um login de teste com sucesso contra a porta local.

**Acceptance Scenarios**:

1. **Given** que os arquivos Dockerfile e docker-compose.yml estão presentes, **When** o desenvolvedor executa o comando de subida dos containers, **Then** o banco de dados e o mock do worker ficam disponíveis localmente e respondem a requisições de login.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST expor um serviço de autenticação na rota `/api/auth/login`.
- **FR-002**: O endpoint MUST validar a senha informada comparando o hash armazenado na tabela `monitor` do PostgreSQL usando a função `crypt` da extensão `pgcrypto`.
- **FR-003**: O backend MUST emitir e assinar um token JWT contendo ID do usuário, e-mail e papel de acesso correspondente.
- **FR-004**: O frontend MUST salvar o token retornado no `localStorage` após a validação e passá-lo nos cabeçalhos HTTP subsequentes.
- **FR-005**: O roteador de rotas (`router/index.ts`) MUST verificar o papel contido no token e negar acessos a `/gestor` se o papel não for exatamente "gestor".

### Key Entities

- **Monitor (Usuário)**: Representa o usuário do sistema, contendo e-mail, senha_hash e role ("gestor" ou "monitor").
- **Token JWT**: Representa a credencial temporária assinada que comprova a identidade e o perfil de acesso do usuário.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das tentativas de acesso de usuários não autorizados a rotas administrativas devem ser bloqueadas no nível de roteamento.
- **SC-002**: A autenticação local deve ser concluída e o token salvo no navegador em menos de 2 segundos.
- **SC-003**: O ambiente de simulação Docker local deve ser inicializado por meio de um único comando unificado.

---

## Assumptions

- O ambiente local simulará a mesma assinatura JWT e chaves criptográficas definidas no Cloudflare Workers.
- A extensão `pgcrypto` já está instalada ou será inicializada no banco de dados local.
- O segredo JWT utilizado no worker será correspondente à chave pública/privada configurada no ambiente de produção.
