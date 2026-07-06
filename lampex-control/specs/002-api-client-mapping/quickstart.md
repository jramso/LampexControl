# Quickstart Validation Guide: Mapeamento de Chamados da API

Este guia descreve os cenários executáveis para validar a integração e o mapeamento dos endpoints da API com o banco Aiven via PostgREST.

---

## 1. Pré-requisitos
* Banco de dados PostgreSQL (Aiven) devidamente inicializado e configurado.
* Variáveis de ambiente configuradas no arquivo `.env`:
  ```ini
  VITE_API_URL=https://lampexcontroldb-lampexcontrol.c.aivencloud.com:11028
  ```

---

## 2. Cenários de Validação

### Cenário 1: Envio de Solicitação de Monitoria
* **Ação**: O aluno preenche e envia o formulário de monitoria.
* **Comando de Teste**:
  ```bash
  npx vitest run tests/integration/us1_tutoring_request.test.ts
  ```
* **Resultado Esperado**: O formulário é validado com sucesso e os dados obrigatórios do aluno (incluindo CPF e Data de Nascimento) são persistidos com status "Pendente".

### Cenário 2: Submissão de Relatório Semanal
* **Ação**: O monitor envia múltiplas atividades em lote na semana de referência.
* **Comando de Teste**:
  ```bash
  npx vitest run tests/integration/us2_monitor_reporting.test.ts
  ```
* **Resultado Esperado**: A requisição RPC `submit_weekly_report` é chamada, inserindo os dados de pai e filho em uma única transação e aplicando as regras de pesos.

### Cenário 3: Consulta do Mapa de Calor
* **Ação**: A coordenação visualiza o painel gestor.
* **Comando de Teste**:
  ```bash
  npx vitest run tests/integration/us3_manager_audit.test.ts
  ```
* **Resultado Esperado**: O sistema executa o GET na view `view_heatmap_disponibilidade` e retorna a lista de disponibilidades agregadas dos monitores.
