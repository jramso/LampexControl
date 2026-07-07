# Technical Research: Mapeamento de Chamados da API

**Feature**: Mapeamento de Chamados da API (Pages Functions + postgres.js + Axios)

---

## 1. Mapeamento de Endpoints e Métodos

### A. Solicitação de Monitoria (POST `/api/solicitacoes_monitoria`)
* **Decisão**: A criação de solicitações de monitoria será exposta pela Page Function em `/functions/api/solicitacoes_monitoria.ts` usando o método POST.
* **Validação LGPD**: O payload obrigatoriamente envia Nome, E-mail, Telefone, CPF e Data de Nascimento do aluno. A função serverless insere esses dados no banco utilizando a biblioteca `postgres`.
* **Justificativa**: A validação cadastral e conformidade com a LGPD são mantidas por meio de políticas RLS no banco e restrições de tabelas.

### B. Registro de Horas (POST `/api/registro_horas`)
* **Decisão**: A submissão transacional unificada do relatório semanal (com múltiplos itens de atividade) será exposta na rota `/api/registro_horas` mapeada para a função serverless `/functions/api/registro_horas.ts`.
* **Mecanismo**: A função serverless iniciará uma transação atômica através da biblioteca `postgres`, chamando a função SQL correspondente ou executando a inserção em lote.

### C. Visualização de Planejamento (GET `/api/view_reuniao_geral`)
* **Decisão**: A rota `/api/view_reuniao_geral` exposta na função `/functions/api/view_reuniao_geral.ts` retorna a matriz ponderada agregada.
* **Justificativa**: Consome diretamente a view SQL correspondente no banco usando o driver `postgres`, encapsulando as consultas.

### D. Dados de Contato com Privacidade (GET `/api/view_contato_monitor`)
* **Decisão**: O frontend solicita dados de contato do monitor associado na rota `/api/view_contato_monitor` enviando o `chamado_id` e o `cpf_aluno` como filtros de busca. A função serverless configura o contexto da sessão (JWT Claims do monitor/aluno) e consulta a view `/view_contato_monitor` que filtra com base nas configurações de privacidade e status "Confirmado" do chamado.

---

## 2. Padrões de Integração e Melhores Práticas

### Gerenciamento de Conexões Serverless
* **Decisão**: Declaração de uma única instância global/módulo do cliente `postgres` (fora do request handler) para reutilizar conexões abertas entre warm starts.
* **Configuração do Pool**: O tamanho máximo do pool será limitado (`max: 1` ou `max: 2`) com um timeout de inatividade agressivo para evitar esgotar as conexões do banco de dados na Aiven.

### Cliente HTTP no Frontend
* **Decisão**: Substituição total do cliente PostgREST pela biblioteca **Axios** em `src/services/apiClient.ts`.
* **Benefício**: Oferece tratamento simplificado de interceptores (para injetar tokens JWT e gerenciar cabeçalhos de Prefer) e é amplamente adotado para chamadas REST robustas no ecossistema Vue.

---

## 3. Alternativas Consideradas e Rejeitadas

* **Alternativa 1**: Utilizar o driver `pg` (node-postgres) em vez de `postgres.js`.
  * **Motivo da Rejeição**: A biblioteca `postgres` (postgres.js) possui melhor suporte nativo a ESM, tipagem mais moderna, melhor desempenho de concorrência e gerenciamento automático e simplificado de conexões em ambientes edge/serverless.
* **Alternativa 2**: Manter o cliente PostgREST frontend e apenas fazer um proxy na rota.
  * **Motivo da Rejeição**: Violaria a intenção de tornar o sistema totalmente serverless e independente de middleware intermediário (PostgREST), movendo a complexidade de conexões e segurança diretamente para a camada serverless + banco.
