# LampexControl API

Este é o projeto da API serverless do **LampexControl**, configurado para rodar como um Cloudflare Worker. Ele se conecta ao banco de dados PostgreSQL (Aiven) usando Hyperdrive e fornece endpoints para autenticação e manipulação das tabelas do banco de dados (padrão PostgREST).

---

## 🚀 Como Executar Localmente

### 1. Requisitos
* Node.js (versão 22 ou superior)

### 2. Configurar Variáveis locais (`.dev.vars`)
O arquivo `.dev.vars` deve ser criado na raiz deste subdiretório com as chaves necessárias para o desenvolvimento local. Ele deve conter:
```env
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=postgresql://avnadmin:your_password_here@lampexcontroldb-lampexcontrol.c.aivencloud.com:11028/defaultdb?sslmode=require
```

### 3. Rodar o Servidor do Worker
Instale as dependências caso ainda não o tenha feito:
```bash
npm install
```

Inicie o servidor de desenvolvimento do Wrangler:
```bash
npm run dev
```

Por padrão, a API estará escutando na porta **`8787`** (`http://localhost:8787`).

---

## 🌐 Deploy no Cloudflare Workers

Para realizar o deploy da API na sua conta da Cloudflare:

1. Faça login na Cloudflare CLI:
   ```bash
   npx wrangler login
   ```

2. Realize o deploy:
   ```bash
   npm run deploy
   ```

Isso publicará a API em `lampex-control-api.<seu-subdominio>.workers.dev` (ou o domínio personalizado configurado).

---

## 🔒 Configuração de Secrets em Produção
Após realizar o deploy, lembre-se de configurar as variáveis confidenciais (secrets) no ambiente de produção usando os comandos:
```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put JWT_SECRET
```
