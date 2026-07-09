# Guia de Validação Rápida: Governança de Ações de Extensão

Este guia descreve os passos para validar localmente as novas funcionalidades de governança de Ações de Extensão, validação robusta por matrícula, monitoria com professor integrada e relatórios agrupados.

## Pré-requisitos

1. Banco de dados PostgreSQL com a migração do [data-model.md](data-model.md) aplicada na nuvem (Aiven).
2. API (/lampex-control-api) rodando localmente (`wrangler dev`).
3. Frontend (/lampex-control) rodando localmente (`npm run dev`).

---

## Cenário 1: Seleção Dinâmica de Ações de Extensão e Filtragem

1. No frontend, acesse a página de Monitoria Rápida (`http://localhost:5173/atendimento-rapido` ou `/`).
2. Verifique que o campo de seleção de "Ação de Extensão" é carregado dinamicamente com as opções ativas da API.
3. Selecione a ação de extensão "Projeto Include".
4. Verifique que a listagem de voluntários é atualizada imediatamente, mostrando apenas os voluntários que estão atrelados ao "Projeto Include" no banco de dados.

---

## Cenário 2: Validação de Matrícula (Últimos 4 Dígitos)

1. Preencha os dados do estudante (matrícula, nome, modalidade = "Presencial").
2. No campo "Código de Segurança do Monitor", digite um código de 4 dígitos incorreto (diferente do final da matrícula do voluntário selecionado).
3. Tente submeter o formulário.
4. **Resultado Esperado**: O sistema rejeita o registro, exibindo um alerta indicando que o código do monitor é inválido.
5. Altere o código para os 4 últimos dígitos corretos da matrícula do voluntário selecionado.
6. Submeta o formulário.
7. **Resultado Esperado**: O atendimento é registrado com sucesso.

---

## Cenário 3: Validação de "Presencial com Professor" com senha_sessao

1. Selecione a modalidade de atendimento "Presencial com Professor".
2. Verifique que o campo "Senha de Aula" é renderizado de forma reativa no formulário (através da condição `v-if`).
3. Tente registrar o atendimento sem senha ou com uma senha errada.
4. **Resultado Esperado**: O sistema rejeita o registro com erro informando falha de verificação da senha.
5. Insira a senha correta gerada pelo professor para a aula da data de hoje.
6. Submeta o formulário.
7. **Resultado Esperado**: O atendimento é validado com sucesso e os campos `senha_sessao` e `professor_id` são populados na tabela `registro_atendimento`.

---

## Cenário 4: Geração de Relatórios por Ação de Extensão

1. Faça login como gestor (ex: Bruno ou Josué).
2. Acesse a aba de **Relatórios** no painel administrativo (`/dashboard`).
3. Selecione um período de datas e clique em Filtrar.
4. **Resultado Esperado**:
   - As métricas de produtividade de voluntários são exibidas agrupadas sob o título de cada Ação de Extensão correspondente, computando o fator multiplicador por 2.0x.
   - O consumo de horas dos alunos é exibido agrupado por Ação de Extensão, computando as horas brutas reais sem multiplicador.

---

## Cenário 5: Atribuição de Gestor Temporário (Toggle)

1. No painel administrativo, acesse a aba de **Gestão de Cargos**.
2. Localize um voluntário (por exemplo, Bruno Gestor ou Emmanuel Gestor, se estiverem como voluntários, ou outro monitor da lista).
3. Clique no botão correspondente para alternar (toggle) o cargo.
4. **Resultado Esperado**:
   - A role do voluntário é atualizada para `gestor_temporario`. Ele agora pode realizar ações de coordenação.
   - Clicar novamente rebaixa o voluntário para a role original `voluntario`, revogando o acesso administrativo.
