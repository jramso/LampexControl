# Quickstart Validation Guide: Autenticação Serverless e Proteção de Rotas

Este guia descreve os cenários executáveis para validar a autenticação serverless por meio do Cloudflare Workers e as travas de proteção de rotas no Vue Router.

---

## 1. Pré-requisitos
* Banco de dados local ou na nuvem contendo a tabela `monitor` com dados populados.
* Contêineres Docker do ambiente local ativos e escutando requisições.

---

## 2. Cenários de Validação

### Cenário 1: Autenticação de Gestor com Credenciais Corretas
* **Ação**: Realizar login na rota `/api/auth/login` informando as credenciais válidas do gestor.
* **Comando de Teste**:
  ```bash
  npx vitest run tests/integration/us1_auth_flow.test.ts
  ```
* **Resultado Esperado**: O servidor responde com status HTTP 200 contendo o token JWT assinado, e o papel decodificado é exatamente `"gestor"`.

### Cenário 2: Login com Credenciais Inválidas
* **Ação**: Enviar uma senha incorreta no corpo da requisição.
* **Resultado Esperado**: O servidor responde com status HTTP 401 e a mensagem `"E-mail ou senha incorretos."`.

### Cenário 3: Bloqueio de Acesso a Rotas Restritas (Travas de Rota)
* **Ação**: Tentar navegar diretamente para o endereço `/gestor` sem possuir o token JWT com a role de gestor.
* **Comando de Teste**:
  ```bash
  npx vitest run tests/integration/us2_route_guards.test.ts
  ```
* **Resultado Esperado**: O Vue Router intercepta a tentativa de navegação no guard `beforeEach`, bloqueia o acesso e redireciona o usuário para a rota `/login` (se não autenticado) ou `/perfil` (se autenticado como monitor).
