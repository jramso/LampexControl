# LampexControl

Plataforma de gerenciamento e controle de monitorias e reuniões do laboratório LAMPEX. Desenvolvida utilizando uma arquitetura moderna serverless de Cloudflare Pages + Vue 3 + TypeScript + PostgreSQL.

---

## 🚀 Como Executar o Projeto Localmente

Para rodar todo o ecossistema (frontend + backend serverless das Pages Functions + banco de dados) localmente:

### 1. Requisitos
* Docker instalado (para rodar o banco de dados e PostgREST locais, opcional se usar Aiven diretamente).
* Node.js (versão 22 ou superior).

### 2. Configuração do `.dev.vars`
Crie ou edite o arquivo `.dev.vars` na raiz do projeto com as chaves de conexão do banco de dados Aiven (ou local):
```ini
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=
```

### 3. Executar o Servidor de Desenvolvimento
Inicie o frontend Vite em um terminal:
```bash
npm run dev
```

Em um **segundo terminal**, inicie o emulador de Pages Functions do Wrangler que se conecta ao Vite:
```bash
npm run dev:pages
```

* O Wrangler ficará ativo na porta **`8788`**.
* Acesse **`http://localhost:8788`** no seu navegador para testar o site completo com a API integrada!

---

## 🧪 Suíte de Testes (Vitest)

Para rodar os testes de integração e validação de rotas, execute:
```bash
npx vitest run
```
