# Feature Specification: Replanejamento de Cargos e Monitoria com Professor

**Feature Branch**: `003-role-replan-monitoring`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User description: "Implementar o replanejamento de cargos e a monitoria com professor conforme as novas diretrizes veja lampex-core-spec2.md . No subprojeto '/lampex-control-api', atualizar o CHECK de roles para suportar ('voluntario', 'professor', 'gestor_fixo', 'gestor_temporario'), modificar o endpoint 'POST /api/atendimentos/registrar' para forçar a validação dos 4 últimos dígitos da matrícula do monitor e a conferência de senha para 'Presencial com Professor'. No subprojeto '/lampex-control', injetar no formulário 'MonitoriaRapida.vue' o campo de código do monitor e o input condicional de senha de aula, e atualizar o 'ManagerDashboard.vue' com a ferramenta de atribuição de cargo de gestor temporário para Bruno Gestor e Emmanuel Gestor."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validação Avançada de Atendimento Regular (Priority: P1)

Como um estudante que acabou de receber atendimento de um monitor no laboratório, eu quero registrar o meu atendimento informando o código de 4 dígitos do monitor para garantir a veracidade da validação.

**Why this priority**: Crítico/P1. Protege o sistema contra registros falsos ou acidentais de atendimento ao exigir que o aluno tenha contato visual ou direto com o código do monitor.

**Independent Test**: O estudante seleciona o monitor em uma lista, digita os 4 últimos dígitos da matrícula do monitor, preenche seus dados e envia o formulário. O sistema aceita o envio apenas se o código de 4 dígitos coincidir com o cadastro do monitor no banco de dados.

**Acceptance Scenarios**:

1. **Given** que o estudante está no formulário de atendimento rápido, **When** ele seleciona um monitor e insere os 4 últimos dígitos corretos da matrícula daquele monitor, **Then** o formulário é validado e o atendimento é registrado com sucesso.
2. **Given** que o estudante seleciona um monitor mas insere um código de 4 dígitos incorreto, **When** ele submete o formulário, **Then** o backend rejeita a requisição informando código inválido, e o frontend exibe uma mensagem de erro apropriada.

---

### User Story 2 - Registro de Monitoria Especial "Presencial com Professor" (Priority: P1)

Como um estudante participando de uma aula ou atendimento conduzido por um professor, eu quero selecionar a modalidade "Presencial com Professor" e validar a presença inserindo a "Senha de Aula" fornecida pelo professor para aquela aula.

**Why this priority**: Crítico/P1. Garante que os atendimentos excepcionais com professores sejam devidamente validados através de uma senha de aula gerada pelo professor e válida para o dia corrente.

**Independent Test**: O estudante seleciona o modalidade "Presencial com Professor" no formulário de atendimento. Um campo de senha é exibido. O estudante insere a senha fornecida pelo professor e submete. O sistema valida a senha contra a aula ativa cadastrada pelo professor.

**Acceptance Scenarios**:

1. **Given** que a modalidade selecionada é "Presencial com Professor", **When** o estudante insere a senha de aula correta e ativa para o dia, **Then** o atendimento é registrado no banco de dados.
2. **Given** que a modalidade selecionada é "Presencial com Professor", **When** a aula correspondente já foi fechada manualmente pelo professor ou o dia já virou, **Then** o sistema recusa o envio com erro de validação.
3. **Given** que a modalidade selecionada é "Presencial com Professor", **When** o estudante insere uma senha incorreta, **Then** o sistema recusa o envio com erro de senha de aula inválida.

---

### User Story 3 - Gestão de Cargos de Gestores Temporários (Priority: P2)

Como coordenador do LAMPEX (gestor_fixo), eu quero ter uma ferramenta simples no painel administrativo para atribuir ou revogar o cargo de gestor temporário para Bruno Gestor e Emmanuel Gestor de forma ágil.

**Why this priority**: Média/P2. Permite delegar responsabilidades administrativas temporárias para Bruno Gestor e Emmanuel Gestor de forma controlada.

**Independent Test**: O coordenador logado (Josué) acessa o painel de gestão, clica no botão correspondente para ativar/desativar o cargo de Bruno Gestor ou Emmanuel Gestor e a role deles é atualizada no banco.

**Acceptance Scenarios**:

1. **Given** que o coordenador está na aba de gestão, **When** ele clica no botão para promover Bruno Gestor a gestor temporário, **Then** o cargo de Bruno Gestor é atualizado no banco de dados para `gestor_temporario`.
2. **Given** que Emmanuel Gestor está ativo como gestor temporário, **When** o coordenador clica para revogar o cargo, **Then** o cargo de Emmanuel Gestor retorna para seu cargo de origem e seu acesso administrativo é removido.

---

### User Story 4 - Geração e Controle de Senhas de Aula pelo Professor (Priority: P1)

Como um professor do LAMPEX, eu quero criar uma senha de aula temporária válida para o dia de hoje no meu perfil e poder fechar o recebimento de cadastros antecipadamente para que apenas os alunos presentes na aula se cadastrem.

**Why this priority**: Crítico/P1. Permite ao professor controlar o período de tempo e as credenciais exatas que os estudantes usarão para confirmar sua presença, evitando registros fora de hora ou por alunos ausentes.

**Independent Test**: O professor faz login, acessa sua área de perfil, gera uma nova senha de aula ("senha123") para o dia corrente. Ele pode clicar no botão "Fechar Recebimento" para encerrar a aula antes do fim do dia.

**Acceptance Scenarios**:

1. **Given** que o professor está logado no perfil, **When** ele insere uma senha e clica em "Criar Aula", **Then** uma nova aula com status `'Ativo'` é registrada para o dia corrente e exibida no perfil.
2. **Given** que há uma aula ativa, **When** o professor clica em "Encerrar Recebimento", **Then** o status da aula muda para `'Fechado'` no banco de dados e os alunos não conseguem mais registrar atendimentos com essa senha.

---

### Edge Cases

- **Validação de Código de Monitor sem Matrícula**: O que acontece se a matrícula do monitor selecionado não estiver cadastrada no banco?
  - *Comportamento esperado*: A API deve retornar erro informando que o monitor não possui matrícula válida cadastrada.
- **Encerramento Automático Diário**: O que acontece se a aula foi criada ontem e ainda está com status `'Ativo'` no banco?
  - *Comportamento esperado*: O backend deve validar que a aula pertence ao dia corrente (`data_aula = CURRENT_DATE`). Se for de datas anteriores, o registro de atendimento deve ser rejeitado automaticamente, independente do status da coluna.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O subprojeto `/lampex-control-api` deve atualizar a restrição CHECK da coluna `role` na tabela `monitor` para suportar exclusivamente: `'voluntario'`, `'professor'`, `'gestor_fixo'`, `'gestor_temporario'`.
- **FR-002**: Deve ser criada uma tabela `monitoria_professor` no banco para armazenar a senha da aula (`senha_aula`), a data (`data_aula`), o ID do professor (`professor_id`) e o status (`'Ativo'`, `'Fechado'`).
- **FR-003**: O endpoint `POST /api/atendimentos/registrar` deve aceitar a propriedade `codigo_monitor` (4 últimos dígitos da matrícula) e validar se esta corresponde aos 4 últimos dígitos da matrícula cadastrada para o `monitor_id` fornecido.
- **FR-004**: A tabela `registro_atendimento` deve atualizar seu CHECK de modalidade para suportar `'Presencial'`, `'Online'` e `'Presencial com Professor'`.
- **FR-005**: O endpoint `POST /api/atendimentos/registrar` deve validar se a modalidade é `'Presencial com Professor'`. Se for, deve obrigar o envio do campo `senha_aula` e validar se existe uma aula cadastrada na tabela `monitoria_professor` para o `monitor_id` (professor) que esteja com `status = 'Ativo'`, com `data_aula = CURRENT_DATE` e cuja senha coincida com a fornecida.
- **FR-006**: O backend deve atualizar todos os middlewares ou verificações de rotas protegidas que exigiam `role = 'gestor'` para aceitarem tanto a role `'gestor_fixo'` quanto a role `'gestor_temporario'`.
- **FR-007**: No subprojeto `/lampex-control`, a tela pública `MonitoriaRapida.vue` deve exibir um campo de texto obrigatório para o "Código do Monitor (4 últimos dígitos da matrícula)".
- **FR-008**: O formulário `MonitoriaRapida.vue` deve escutar reativamente a modalidade selecionada e, caso seja `'Presencial com Professor'`, deve exibir um campo de senha obrigatório ("Senha de Aula").
- **FR-009**: O painel administrativo `ManagerDashboard.vue` deve conter uma nova ferramenta para controle de acesso temporário, listando Bruno Gestor (`bruno@ifes.edu.br`) e Emmanuel Gestor (`emmanuel@ifes.edu.br`) com opções para definir ou revogar o cargo de `gestor_temporario`.
- **FR-010**: No subprojeto `/lampex-control`, a página de perfil `MonitorProfile.vue` deve incluir um painel exclusivo para usuários com a role `'professor'`, permitindo criar senhas de aula para o dia corrente e encerrar o recebimento de cadastros das aulas geradas.

### Key Entities *(include if feature involves data)*

- **Monitor (Tabela `monitor`)**:
  - `role`: TEXT com CHECK restringindo a (`'voluntario'`, `'professor'`, `'gestor_fixo'`, `'gestor_temporario'`)

- **Monitoria Professor (Tabela `monitoria_professor`)**:
  - `id`: UUID (Chave primária)
  - `professor_id`: UUID referenciando `monitor(id)`
  - `senha_aula`: TEXT (Senha definida para a aula)
  - `data_aula`: DATE (Data da realização da aula, padrão CURRENT_DATE)
  - `status`: TEXT restringindo a (`'Ativo'`, `'Fechado'`)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O estudante consegue registrar uma monitoria com professor em menos de 1.5 minutos.
- **SC-002**: O sistema bloqueia 100% das tentativas de registro de atendimento onde o código do monitor ou a senha de aula estejam incorretos ou a aula correspondente já esteja expirada/fechada.
- **SC-003**: O professor consegue criar uma senha de aula ou fechá-la no seu painel de perfil com apenas 1 clique.

## Assumptions

- A validação automática de encerramento ao final do dia é baseada no dia civil corrente (`CURRENT_DATE` do fuso horário configurado no banco de dados).
- O professor possui permissão para gerenciar apenas as suas próprias senhas de aula.
- O campo `senha_aula` é uma string simples de texto visível ou compartilhada em sala pelo professor.
