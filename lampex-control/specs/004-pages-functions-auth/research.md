# Technical Research: Migração para Cloudflare Pages Functions

Este documento detalha as decisões técnicas, a arquitetura e a viabilidade da migração do fluxo de autenticação serverless para o Cloudflare Pages Functions.

---

## 1. Estrutura e Roteamento de Pages Functions

### Decisão
Criar o arquivo de endpoint em `/functions/api/auth/login.ts` exportando a função `onRequestPost`.

### Racional
O Cloudflare Pages analisa a pasta `/functions/` no momento da compilação e gera automaticamente as rotas de API correspondentes. 
* Arquivo físico: `[raiz]/functions/api/auth/login.ts`
* Rota pública gerada: `/api/auth/login` (recebendo requisições `POST`).

O tipo de manipulador nativo para TypeScript no Pages é:
```typescript
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  // ... lógica ...
}
```

---

## 2. Injeção de Bindings e Variáveis de Ambiente

### Decisão
Acessar os segredos e bindings (`DATABASE_URL`, `JWT_SECRET`, e `HYPERDRIVE`) por meio de `context.env` ao invés de argumentos globais de Workers.

### Racional
No Cloudflare Pages Functions, todas as variáveis de ambiente e bindings associados (como o Hyperdrive) são consolidados na propriedade `env` do objeto `context` fornecido a cada handler de requisição.

A interface do ambiente (`Env`) permanece idêntica à do Worker anterior, facilitando a portabilidade do código:
```typescript
export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  HYPERDRIVE?: {
    connectionString: string;
  };
}
```

---

## 3. Conexão TCP e TLS (SSL) com PostgreSQL na Aiven

### Decisão
Manter a dependência unificada do driver `pg` (node-postgres) em sua versão `^8.13.0` no diretório principal do projeto (ou no Pages Functions bundle) e habilitar a flag `nodejs_compat` nas configurações do Pages.

### Racional
O driver `pg` em conjunto com a flag `nodejs_compat` permite realizar conexões TCP brutas a partir de Pages Functions de forma transparente. A biblioteca de criptografia Web Cryptography API (`crypto.subtle`) é nativamente suportada sem necessidade de pacotes externos.

---

## 4. Alternativas Consideradas e Rejeitadas

* **Alternativa Rejeitada: Manter o Worker separado (Repositório Duplo)**
  * *Por que foi rejeitada*: Manter o Worker como uma aplicação separada do repositório frontend do Vue 3 adiciona fricção no deploy e no desenvolvimento local, exigindo que o usuário gerencie e mantenha duas implantações distintas na nuvem. As Pages Functions unificam tudo em um único deploy acionado pelo mesmo git commit.
* **Alternativa Rejeitada: Uso de biblioteca JWT externa (jose/jsonwebtoken)**
  * *Por que foi rejeitada*: O uso da Web Cryptography API nativa (`crypto.subtle`) provou ser extremamente leve, rápido e com zero dependências externas no pacote compilado final.
