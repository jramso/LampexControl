# Quickstart & Validation Guide: Validação de Atendimentos via QR Code

Este guia fornece os passos e comandos necessários para testar e validar o fluxo de validação de atendimentos via QR Code de ponta a ponta.

## Pré-requisitos

1. **Migração do Banco de Dados**: A tabela `registro_atendimento` deve estar criada no banco PostgreSQL.
2. **Servidores em Execução**:
   - Backend (`/lampex-control-api`): rodando localmente via `npm run dev` na porta 8787 (ou similar).
   - Frontend (`/lampex-control`): rodando localmente via `npm run dev` na porta 5173 (ou similar).
3. **Credencial de Gestor**: Tenha um token JWT de gestor ativo para testar as rotas protegidas (gerado ao fazer login no painel administrativo).

---

## Validação 1: Cadastro de Atendimento (Público)

Simula o aluno escaneando o QR Code e preenchendo o formulário de atendimento rápido.

### Passo 1: Via Interface Gráfica
1. Abra o navegador e acesse: `http://localhost:5173/atendimento-rapido`.
2. O dropdown de monitores deve listar os monitores ativos carregados do banco.
3. Preencha os campos:
   - **Matrícula**: `2026998877`
   - **Nome**: `Aluno Teste Quickstart`
   - **Modalidade**: `Presencial`
   - **Local ou Link**: `Sala 204`
   - **Duração (Horas)**: `2`
4. Clique em **Registrar Atendimento**.
5. Deve ser exibido um alerta ou tela de confirmação de sucesso.

### Passo 2: Teste Direto na API (curl)
```bash
curl -X POST http://localhost:8787/api/atendimentos/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "monitor_id": "8f8b898d-8a8b-8c8d-8e8f-909192939495",
    "matricula": "2026998877",
    "nome": "Aluno Teste Quickstart",
    "modalidade": "Presencial",
    "local_ou_link": "Sala 204",
    "horas_duracao": 2.0
  }'
```
*Retorno esperado: Status `201 Created` e os dados do atendimento criado no JSON.*

---

## Validação 2: Relatório de Produtividade dos Monitores (Fator x2)

Testa o endpoint protegido que retorna a produtividade dos monitores com o multiplicador de planejamento.

### Passo 1: Teste Direto na API (curl)
1. Obtenha o token JWT após autenticar-se no dashboard de gestor.
2. Execute o comando:
```bash
curl -X GET "http://localhost:8787/api/relatorios/monitores?start_date=2026-07-01&end_date=2026-07-31" \
  -H "Authorization: Bearer <SEU_TOKEN_JWT>"
```
*Retorno esperado: Uma lista de monitores e suas respectivas horas totais multiplicadas por 2. Por exemplo, o monitor do teste anterior (2 horas) deve aparecer com `4.00` horas de planejamento.*

---

## Validação 3: Relatório de Consumo dos Alunos (Sem Fator)

Testa o endpoint protegido que retorna as horas brutas consumidas pelos alunos.

### Passo 1: Teste Direto na API (curl)
```bash
curl -X GET "http://localhost:8787/api/relatorios/alunos?start_date=2026-07-01&end_date=2026-07-31" \
  -H "Authorization: Bearer <SEU_TOKEN_JWT>"
```
*Retorno esperado: Uma lista contendo o aluno `"Aluno Teste Quickstart"`, matrícula `"2026998877"` e `2.00` horas consumidas (sem o fator x2).*

---

## Validação 4: Painel Administrativo de Relatórios

Valida a visualização das duas tabelas agregadas no frontend.

1. Faça login como gestor em `http://localhost:5173/login`.
2. Vá para o Painel de Gestão e clique na aba **Relatórios**.
3. Selecione o período de datas inicial e final.
4. Verifique se:
   - A tabela **Produtividade dos Monitores (Planejamento x2)** é exibida corretamente.
   - A tabela **Consumo dos Alunos (Horas Reais)** é exibida independentemente.
   - Os cabeçalhos e componentes de destaque utilizam o verde institucional `#008744`.
5. Tente filtrar informando data inicial posterior à data final e certifique-se de que a interface valida e bloqueia o envio.
