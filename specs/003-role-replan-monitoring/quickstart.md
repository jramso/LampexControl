# Guia de Validação Rápida: Replanejamento de Cargos e Monitoria com Professor

Este guia descreve os passos para testar e validar localmente as novas funcionalidades de replanejamento de cargos, validação de matrícula e monitoria com professor.

## Pré-requisitos

1. Banco de dados PostgreSQL local (Docker) ou desenvolvimento ativo.
2. API executando localmente (`wrangler dev` ou `npm run dev` na pasta `/lampex-control-api`).
3. Frontend executando localmente (`npm run dev` na pasta `/lampex-control`).

---

## Cenário 1: Migração de Roles e Execução de Scripts SQL

1. Aplique a migração de banco correspondente à nova estrutura:
   - Execute o script de migração `010_role_replan_monitoring.sql` para alterar o CHECK de roles, criar a tabela `monitoria_professor` e atualizar o CHECK de modalidade de atendimento.
2. Valide que as roles antigas foram migradas corretamente:
   - Josué (`josue.rsou2@gmail.com`) deve possuir a role `'gestor_fixo'`.
   - Bruno Gestor (`bruno@ifes.edu.br`) deve possuir a role `'gestor_fixo'`.
   - Emmanuel Gestor (`emmanuel@ifes.edu.br`) deve possuir a role `'gestor_fixo'`.
   - O monitor padrão deve possuir a role `'voluntario'`.

---

## Cenário 2: Validação de Matrícula (Últimos 4 Dígitos)

1. No frontend, acesse `http://localhost:5173/atendimento-rapido`.
2. Selecione o monitor "Monitor de Testes" (cujo final da matrícula é `0001`).
3. Preencha seus dados de aluno (nome, matrícula, etc.).
4. Insira um código de monitor incorreto (ex: `9999`).
5. **Resultado Esperado**: O sistema exibe um alerta de erro e impede o registro.
6. Digite o código correto (`0001`) e submeta o formulário.
7. **Resultado Esperado**: O atendimento é registrado com sucesso.

---

## Cenário 3: Validação de "Presencial com Professor" com Senha do Dia

1. Faça login como professor no sistema (role = `'professor'`).
2. Acesse a área de perfil (`/perfil`) e localize o painel de "Gerenciamento de Aulas".
3. Digite uma senha de aula (ex: `aula123`) e clique em "Criar Aula". A aula aparecerá listada como ativa.
4. Acesse a tela pública de atendimento rápido (`/atendimento-rapido`).
5. Escolha o professor correspondente, selecione a modalidade "Presencial com Professor".
6. Verifique que o campo "Senha de Aula" é renderizado na tela.
7. Digite uma senha errada (ex: `errada`) e clique em registrar.
8. **Resultado Esperado**: O backend rejeita a inserção informando erro de credenciais da aula.
9. Digite a senha correta (`aula123`) e clique em registrar.
10. **Resultado Esperado**: O atendimento é registrado com sucesso.
11. Volte ao painel do professor no perfil e clique em "Encerrar Recebimento" para a aula criada.
12. Tente registrar um novo atendimento com la mesma senha.
13. **Resultado Esperado**: O backend rejeita a inserção informando que a aula foi encerrada.

---

## Cenário 4: Promoção de Gestor Temporário (Bruno Gestor e Emmanuel Gestor)

1. Faça login como gestor fixo (Josué).
2. Acesse o Painel de Gestão e localize a ferramenta de controle de cargos de Bruno Gestor e Emmanuel Gestor.
3. Clique em "Promover a Gestor Temporário" para Bruno Gestor. (Inicialmente Bruno Gestor é gestor_fixo; podemos alterar seu cargo para voluntário/professor antes para testar a promoção).
4. Faça logout e login como Bruno Gestor.
5. **Resultado Esperado**: Bruno Gestor agora consegue visualizar e interagir com o Painel de Gestão e os Relatórios sob a role temporária.
6. Faça logout e login novamente como Josué.
7. Clique em "Revogar Gestor Temporário" para Bruno Gestor.
8. **Resultado Esperado**: O cargo de Bruno Gestor retorna ao estado base e ele não consegue mais acessar recursos administrativos (retorna erro 403 nas chamadas protegidas caso não seja gestor_fixo).
