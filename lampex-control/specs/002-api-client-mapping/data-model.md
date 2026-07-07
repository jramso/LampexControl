# Data Model: Mapeamento de Chamados da API

Esta seção descreve o modelo de dados relacional e a modelagem lógica utilizada no cliente de integração da API do LampexControl.

---

## 1. Dicionário de Entidades

### A. Solicitação de Monitoria (`solicitacao_monitoria`)
Representa o chamado aberto pelo aluno para agendamento técnico.
* **id** (`UUID`): Chave primária.
* **nome_aluno** (`TEXT`): Nome completo do aluno.
* **email_aluno** (`TEXT`): E-mail de contato do aluno.
* **telefone_aluno** (`TEXT`): WhatsApp ou telefone do aluno.
* **cpf_aluno** (`VARCHAR(11)`): Documento obrigatório (restrito à visualização conforme a LGPD).
* **descricao_duvida** (`TEXT`): Texto livre descrevendo a dúvida.
* **formato** (`TEXT`): Presencial ou Online.
* **horarios_disponiveis** (`JSONB`): Grade de dias e períodos desejados.
* **status** (`TEXT`): Estado do chamado (Pendente/Confirmado/Cancelado).
* **monitor_responsavel_id** (`UUID`): Chave estrangeira referenciando o monitor alocado.

### B. Registro Semanal (`registro_semanal`)
Representa a folha de ponto semanal do monitor bolsista/voluntário.
* **id** (`UUID`): Chave primária.
* **monitor_id** (`UUID`): Chave estrangeira referenciando o monitor proprietário.
* **semana_referencia** (`DATE`): Data de início ou referência da semana de trabalho.
* **arquivo_pdf_url** (`TEXT`): Link para o PDF comprovante do relatório Proex.

### C. Item de Atividade (`item_atividade`)
Item de atividade atrelado ao registro semanal.
* **id** (`UUID`): Chave primária.
* **registro_semanal_id** (`UUID`): Chave estrangeira referenciando o cabeçalho do registro semanal.
* **tipo_atividade** (`TEXT`): Tipo de tarefa (Monitoria, Minicurso, Marketing, Dev, Outros).
* **horas_brutas** (`NUMERIC`): Carga horária executada.
* **horas_liquidas** (`NUMERIC`): Carga horária líquida (calculada pela trigger de pesos no banco de dados).
* **evidencia_url** (`TEXT`): Link contendo a evidência de execução da tarefa.

---

## 2. Validações de Integridade e Relações de Transação

### Transação de Registro Semanal
Ao submeter o registro semanal, as Pages Functions executam uma transação atômica no banco de dados (usando a funcionalidade `sql.begin` do `postgres` ou uma stored procedure `registro_horas`).
1. Cria a entrada na tabela `registro_semanal`.
2. Insere múltiplos registros correspondentes na tabela `item_atividade` associados ao `registro_semanal_id` recém-criado.
3. Se qualquer inserção falhar, toda a transação é cancelada (rollback automático).

### Proteção LGPD e Filtros RLS
A segurança do CPF e dados sensíveis de contato do monitor é delegada ao banco.
* A função serverless executa as consultas SQL após injetar os claims do JWT ativo usando a sessão temporária do Postgres (`SELECT set_config('request.jwt.claims', $1, true)`).
* As políticas de RLS e Views como `view_contato_monitor` filtram e ocultam o CPF/telefone com base nas permissões do papel (aluno com agendamento confirmado vs. gestor vs. listagem pública).
