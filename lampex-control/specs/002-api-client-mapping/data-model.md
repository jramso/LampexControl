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
* **semana_referencia** (`DATE`): Data de início ou representação da semana de trabalho.
* **arquivo_pdf_url** (`TEXT`): Link para o PDF comprovante do relatório Proex.

### C. Item de Atividade (`item_atividade`)
Item individual de atividade inserido na transação da folha de ponto.
* **id** (`UUID`): Chave primária.
* **registro_semanal_id** (`UUID`): Chave estrangeira referenciando o cabeçalho do registro semanal.
* **tipo_atividade** (`TEXT`): Tipo de tarefa (Monitoria, Minicurso, Marketing, Dev, Outros).
* **horas_brutas** (`NUMERIC`): Carga horária executada.
* **horas_liquidas** (`NUMERIC`): Carga horária líquida (calculada pela trigger de pesos).
* **evidencia_url** (`TEXT`): Link contendo a evidência de execução da tarefa.

---

## 2. Validações de Integridade e Regras
* **Restrição de Integridade**: Cada monitor só pode enviar um registro consolidado (`registro_semanal`) por semana de referência.
* **Regra de LGPD**: O acesso ao CPF do aluno (`cpf_aluno`) deve ser restrito à coordenação e a rotinas seguras de certificação, não sendo retornado em listagens públicas.
