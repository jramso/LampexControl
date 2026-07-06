# Roteiro de Validação Rápida: Pages Functions Auth

Este guia detalha o cenário de testes integrados e validações manuais para comprovar a migração e funcionamento das Pages Functions.

---

## 1. Pré-requisitos

1. Banco de dados PostgreSQL (Aiven ou Docker local) ativo e com as tabelas e seeds de teste aplicados.
2. Variáveis de ambiente configuradas no arquivo `.dev.vars` (na raiz do projeto, que é lido pelo emulador do Pages Dev):
   ```ini
   DATABASE_URL=postgresql://avnadmin:password@localhost:5432/defaultdb
   JWT_SECRET=your_jwt_secret_here
   ```

---

## 2. Inicialização do Emulador Local Unificado

Para simular o Cloudflare Pages Functions localmente integrado com o Vite, siga os seguintes passos:

1. **Iniciar o frontend Vite** (na porta `5173`):
   ```bash
   npm run dev
   ```

2. **Iniciar o emulador do Pages Dev** proxyando o Vite (em um segundo terminal):
   ```bash
   npx wrangler pages dev --proxy http://localhost:5173 --compatibility-date=2024-09-23 --compatibility-flags=nodejs_compat
   ```
   * O emulador do Wrangler Pages Dev ficará ativo por padrão na porta **`8788`**.
   * Ele servirá o frontend na porta `8788` proxyando a porta `5173`, e interceptará as chamadas de `/api/*` enviando-as diretamente para o interpretador de funções da pasta `/functions/api/`.

---

## 3. Fluxo de Validação Manual

1. Acesse o site pela porta unificada do Pages Dev: `http://localhost:8788/login`.
2. Efetue login como Gestor (`josue.rsou2@gmail.com` / `lampex123`).
3. O frontend fará o `fetch` relativo a `/api/auth/login`, que será interceptado pelo emulador local rodando as functions.
4. Verifique que o login foi bem sucedido e você foi redirecionado para a rota `/dashboard`.
5. Tente acessar a rota `/dashboard` logado como monitor ou sem autenticação, e verifique se o router impede o acesso e redireciona de volta.
