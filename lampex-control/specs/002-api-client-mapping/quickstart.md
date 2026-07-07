# Quickstart Validation Guide: Mapeamento de Chamados da API

Este guia descreve os cenários executáveis para validar a integração e o mapeamento dos endpoints da API com o banco Aiven via Cloudflare Pages Functions (usando `postgres` e `Axios`).

---

## 1. Pré-requisitos e Setup Local

### A. Configurar Variáveis locais (`.dev.vars`)
Crie ou configure o arquivo `.dev.vars` na raiz do projeto contendo as credenciais de conexão do PostgreSQL (Aiven) e o segredo de assinatura de tokens:
```ini
DATABASE_URL=postgres://user:password@host:port/dbname?sslmode=require
JWT_SECRET=sua_chave_secreta_jwt
```

### B. Inicializar o Emulador unificado do Pages Dev
Para executar o frontend e as rotas de API emuladas simultaneamente:
```bash
npm run dev:pages
```
O emulador subirá o servidor proxy na porta `8788`.

---

## 2. Cenários de Validação

### Cenário 1: Envio de Solicitação de Monitoria
* **Ação**: O aluno envia o formulário de solicitação de monitoria.
* **Mecanismo**: O frontend dispara um POST via Axios para `/api/solicitacoes_monitoria`. A Page Function executa a inserção direta usando `postgres`.
* **Validação**: Executar o teste de integração correspondente:
  ```bash
  npx vitest run tests/integration/us1_tutoring_request.test.ts
  ```
* **Resultado Esperado**: O chamado é criado com status inicial "Pendente" e o CPF é guardado com segurança no banco.

### Cenário 2: Submissão de Relatório Semanal
* **Ação**: O monitor envia um lote de atividades na semana de referência.
* **Mecanismo**: POST via Axios para `/api/rpc/registro_horas`. A Page Function inicia uma transação com a biblioteca `postgres` e executa a inserção segura das tarefas.
* **Validação**: Executar o teste:
  ```bash
  npx vitest run tests/integration/us2_monitor_reporting.test.ts
  ```
* **Resultado Esperado**: O relatório é criado, os itens de atividades associados são salvos atomicamente e a trigger de pesos calcula as horas líquidas com sucesso.

### Cenário 3: Consulta do Mapa de Calor (Disponibilidade Geral)
* **Ação**: A gestão acessa a aba de reuniões no painel.
* **Mecanismo**: GET via Axios para `/api/view_reuniao_geral`. A Page Function executa um select na view `view_heatmap_disponibilidade`.
* **Validação**: Executar o teste:
  ```bash
  npx vitest run tests/integration/us3_manager_audit.test.ts
  ```
* **Resultado Esperado**: Retorna a lista ponderada agregada das disponibilidades dos monitores ativos.
