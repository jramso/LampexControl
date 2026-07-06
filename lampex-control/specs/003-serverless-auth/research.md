# Research: Autenticação Serverless e Proteção de Rotas

**Feature**: Autenticação Serverless e Proteção de Rotas (Cloudflare Workers + Docker)

---

## 1. Assinatura e Emissão de JWT em Cloudflare Workers
* **Decisão**: Utilizar a API nativa Web Cryptography (`crypto.subtle`) do ambiente Cloudflare Workers para assinar e validar tokens JWT (algoritmo HMAC SHA-256).
* **Racional**:
  * **Performance**: A API nativa do Web Cryptography roda em nível C++ diretamente na V8 do Cloudflare Worker, possuindo latência praticamente nula (<1ms) e zero consumo extra de CPU.
  * **Tamanho do Bundle**: Não requer nenhuma dependência do npm (como `jsonwebtoken` ou `jwt-simple`), mantendo o bundle final do worker extremamente leve.
* **Alternativas Consideradas**:
  * *Biblioteca `jose`*: Excelente alternativa, porém adiciona dependências extras e aumenta o tamanho do bundle desnecessariamente quando a API nativa atende com total segurança.

---

## 2. Conectividade de Banco de Dados em Ambiente Serverless
* **Decisão**: Utilizar o driver `pg` (node-postgres) em conjunto com a API nativa de sockets do Cloudflare (`cloudflare:sockets`) para conexões TCP diretas com a Aiven.
* **Racional**:
  * **Conexão Direta**: O Cloudflare Workers agora suporta conexões TCP de forma nativa via `connect()` do namespace `cloudflare:sockets`, permitindo conectar ao PostgreSQL da Aiven sem necessidade de túneis ou proxies HTTP extras.
* **Alternativas Consideradas**:
  * *Cloudflare Hyperdrive*: Excelente para produção (pooling de conexões global), mas para simulação local e desenvolvimento básico com Aiven, a conexão direta via `pg` é mais simples de orquestrar no Docker local.

---

## 3. Ambiente de Simulação Local Integrado (Docker)
* **Decisão**: Prover uma configuração Docker Compose contendo:
  1. Um container de banco de dados PostgreSQL (carregando o esquema e ativando `pgcrypto`).
  2. Um container do Worker rodando em modo de emulação local via Wrangler (`npx wrangler dev --ip 0.0.0.0 --local`).
* **Racional**:
  * Permite que desenvolvedores testem todo o fluxo de autenticação e proteção de rotas localmente, de forma idêntica à execução no Cloudflare Edge.
* **Alternativas Consideradas**:
  * *Executar Wrangler na máquina hospedeira*: Funciona, mas exige instalação prévia de Node.js e ferramentas globais na máquina do desenvolvedor. A abordagem em container isola as dependências.
