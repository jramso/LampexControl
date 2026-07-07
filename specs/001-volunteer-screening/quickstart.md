# Quickstart & Verification Guide: Fluxo de Triagem de Voluntários

Este guia descreve os passos e cenários de teste necessários para validar a funcionalidade do Fluxo de Triagem de Voluntários de ponta a ponta.

## Prerequisites

1. **Serviços Ativos**:
   - Backend local (`wrangler dev` na pasta [/lampex-control-api](file:///C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/lampex-control-api) rodando na porta 8787).
   - Frontend local (`npm run dev` na pasta [/lampex-control](file:///C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/lampex-control) rodando na porta 5173).
   - Instância PostgreSQL ativa na nuvem da Aiven.
2. **Setup de Banco de Dados**:
   - Executar a migração `005_volunteer_screening.sql` criada para inicializar a tabela `potencial_voluntario`.
3. **Credencial de Gestor**:
   - O usuário `josue.rsou2@gmail.com` com senha `lam_23!@` deve estar cadastrado na tabela `monitor` com `role = 'gestor'`.

---

## Verification Scenarios

### 1. Cenário Público: Inscrição de Voluntário

Valida o formulário público de cadastro e a persistência na tabela de triagem.

1. Acesse o frontend no navegador na rota `/cadastro`.
2. Preencha o formulário de cadastro com dados válidos:
   - **Nome**: Teste Triagem
   - **Email**: teste.triagem@ifes.edu.br
   - **CPF**: 11122233344
   - **Telefone**: 27988887777
   - **Curso**: Engenharia de Computação
   - **Matrícula**: 2026111222
   - **Como ficou sabendo do Projeto Lampex?**: Avisos do Ifes
3. Clique em **Enviar Candidatura** (Botão Verde).
4. **Resultado Esperado**:
   - Uma mensagem de sucesso deve ser exibida em tela ("Inscrição enviada com sucesso!").
   - Consultando o banco de dados (`SELECT * FROM potencial_voluntario WHERE email = 'teste.triagem@ifes.edu.br'`), o registro deve constar com status `'Pendente'`.

### 2. Cenário Público: Cadastro Duplicado

Valida se a API bloqueia chaves únicas duplicadas.

1. Tente submeter exatamente os mesmos dados do cenário anterior na rota `/cadastro`.
2. **Resultado Esperado**:
   - O frontend deve exibir um alerta/mensagem de erro apropriado ("E-mail, CPF ou Matrícula já cadastrados").
   - A API deve retornar status `409 Conflict`.

### 3. Cenário Administrativo: Visualização da Fila de Triagem

Valida o painel administrativo de triagem restrito a gestores.

1. Acesse a rota `/login` no frontend e faça login com a conta de gestor (`josue.rsou2@gmail.com`).
2. Acesse `/dashboard` e clique na aba **Triagem**.
3. **Resultado Esperado**:
   - O candidato "Teste Triagem" deve estar listado na tabela com suas informações.
   - Os botões **Aprovar** (Verde) e **Rejeitar** (Vermelho) devem estar disponíveis na linha do candidato.

### 4. Cenário Administrativo: Aprovação de Candidato

Valida a aprovação e migração do candidato.

1. Na aba de **Triagem**, clique no botão **Aprovar** (Verde) na linha do candidato "Teste Triagem".
2. **Resultado Esperado**:
   - O candidato deve desaparecer imediatamente da tabela de pendentes.
   - No banco de dados, o registro na tabela `potencial_voluntario` correspondente deve ter seu status atualizado para `'Aprovado'`.
   - Um novo registro deve existir na tabela `monitor` com:
     - `nome = 'Teste Triagem'`
     - `email = 'teste.triagem@ifes.edu.br'`
     - `role = 'monitor'`
     - `senha_hash = [HASH VALIDA]` (testável logando com `teste.triagem@ifes.edu.br` e senha `Lampex@2026111222`).

### 5. Cenário Administrativo: Rejeição de Candidato

Valida a rejeição do candidato.

1. Submeta um novo cadastro com e-mail `teste.rejeitado@ifes.edu.br` e matrícula `2026333444`.
2. No painel de triagem do gestor, clique no botão **Rejeitar** (Vermelho).
3. **Resultado Esperado**:
   - O candidato deve desaparecer da listagem visual.
   - No banco de dados, o status do candidato na tabela `potencial_voluntario` deve ser `'Rejeitado'`.
   - Nenhum registro na tabela `monitor` deve ser criado para este candidato.
