# LampexControl Workspace

Este workspace contém a plataforma **LampexControl** dividida em dois projetos independentes:

1. **`lampex-control` (Frontend):**
   - Aplicação SPA desenvolvida em **Vue 3 + Vite + TypeScript**.
   - Consome a API do Worker.
   - Hospedagem recomendada: **Cloudflare Pages**.
   - Pasta: [lampex-control](file:///C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/lampex-control)

2. **`lampex-control-api` (Backend):**
   - API serverless rodando em **Cloudflare Workers**.
   - Conecta-se diretamente ao PostgreSQL (Aiven) via Hyperdrive.
   - Possui cabeçalhos de CORS habilitados em todas as respostas.
   - Pasta: [lampex-control-api](file:///C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/lampex-control-api)

---

## 🚀 Como Rodar o Ecossistema Localmente

Para rodar ambos os projetos juntos em ambiente de desenvolvimento:

### 1. Iniciar a API (Porta 8787)
Abra um terminal na pasta da API e execute:
```bash
cd lampex-control-api
npm install
npm run dev
```

### 2. Iniciar o Frontend (Porta 5173)
Abra outro terminal na pasta do frontend e execute:
```bash
cd lampex-control
npm install
npm run dev
```

O frontend se comunicará automaticamente com o backend em `http://localhost:8787` (configurado via `.env` do frontend).
