# Technical Research: Mapeamento de Chamados da API

**Feature**: Mapeamento de Chamados da API (PostgREST + TypeScript Client)

---

## 1. Mapeamento de Endpoints e Métodos

### A. Solicitação de Monitoria (POST `/solicitacao_monitoria`)
* **Decisão**: A criação de solicitações de monitoria é exposta pelo endpoint `/solicitacao_monitoria` usando método POST.
* **Coleta LGPD**: O payload deve enviar obrigatoriamente os dados do aluno: Nome, E-mail, Telefone, CPF e Data de Nascimento. O CPF é mantido na tabela do banco de forma isolada, não exposto em listagens públicas.
* **Justificativa**: A coleta de CPF e Data de Nascimento é obrigatória para a validação cadastral e emissão de certificados acadêmicos.

### B. Registro de Horas (POST `/rpc/submit_weekly_report`)
* **Decisão**: Como PostgREST não gerencia requisições complexas pai-filho aninhadas nativamente no método POST padrão sem múltiplos requests, a submissão do registro semanal (com múltiplos itens de atividade) é mapeada para a função RPC `/rpc/submit_weekly_report` utilizando método POST.
* **Justificativa**: Permite atomicidade transacional completa (All-or-Nothing). Caso a inserção de um item de atividade falhe, toda a submissão semanal é revertida.

### C. Visualização de Planejamento (GET `/view_heatmap_disponibilidade`)
* **Decisão**: A coordenação acessa `/view_heatmap_disponibilidade` via método GET para obter a matriz ponderada agregada.
* **Justificativa**: Centraliza o cálculo matemático pesado no banco através da view SQL, simplificando o frontend para realizar apenas a renderização visual do heatmap.

### D. Dados de Contato com Privacidade (GET `/monitor`)
* **Decisão**: Em vez de expor uma view genérica que possa ser vulnerável a vazamento de dados, o cliente acessa os dados autorizados do monitor a partir de um filtro parametrizado no endpoint `/monitor` se a monitoria estiver associada e confirmada. No backend, a trigger ou política RLS garante que o acesso aos dados ocorra apenas sob essas condições e se `permite_exibir_contato` estiver ativado.

---

## 2. Padrões de Integração e Melhores Práticas

### Tratamento de Rate Limiting
* **Decisão**: Quando o PostgREST retornar erro `400` ou `429` decorrente da trigger de rate limiting por IP, o cliente TypeScript intercepta e exibe uma mensagem amigável: "Limite de tentativas excedido. Tente novamente mais tarde."

### Tratamento de Falhas e Arquivos
* **Decisão**: O upload dos comprovantes (PDF) é gerenciado via links de storage externo (ex: AWS S3 ou Google Drive). O cliente apenas envia e persiste a URL final do documento, reduzindo o custo de computação e transferências de arquivos pesados pela API do PostgREST.

---

## 3. Alternativas Consideradas e Rejeitadas

* **Alternativa**: Utilizar Axios/Fetch puro com mapeamento manual das rotas da API.
* **Motivo da Rejeição**: Exigiria recriar todas as interfaces de tipos e caminhos que já constam no contrato OpenAPI, violando o Princípio III (Tipagem Estática End-to-End) e aumentando o custo de manutenção do código.
