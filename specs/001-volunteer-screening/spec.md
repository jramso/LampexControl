# Feature Specification: Fluxo de Triagem de Voluntários

**Feature Branch**: `001-volunteer-screening`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Com base nas diretrizes do lampex-constitution.md e o lampex-core-spec.md, implementar o Fluxo de Triagem de Voluntários dividindo o desenvolvimento nos dois subprojetos. No subprojeto '/lampex-control-api', criar a tabela 'potencial_voluntario', o endpoint público de cadastro e a rota protegida por JWT de aprovação por ID que migra o candidato aprovado para a tabela 'monitor'. No subprojeto '/lampex-control', criar o componente visual 'CadastroMonitor.vue' com o formulário e a pergunta seletiva de origem, e adicionar a aba administrativa de 'Triagem' dentro do 'ManagerDashboard.vue' com botões institucionais verdes e vermelhos para aprovação de cadastros pendentes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro Público de Potenciais Voluntários (Priority: P1)

Como um estudante interessado em se voluntariar como monitor no LAMPEX, eu quero acessar uma página pública com um formulário de cadastro estruturado para que eu possa enviar minhas informações e manifestar meu interesse no projeto.

**Why this priority**: Crítico/P1. É a porta de entrada para o fluxo de triagem. Sem o cadastro do voluntário, nenhum fluxo subsequente existe.

**Independent Test**: O usuário acessa a rota `/cadastro` no frontend `/lampex-control`, preenche o formulário com dados válidos, seleciona a origem do cadastro, clica em enviar e recebe uma confirmação visual de sucesso. Os dados devem estar inseridos no banco com status 'Pendente'.

**Acceptance Scenarios**:

1. **Given** que o usuário está na tela de cadastro público, **When** ele preenche todos os campos obrigatórios (Nome, Email, CPF, Telefone, Curso, Matrícula) com formatos válidos e escolhe a opção de origem do cadastro, **Then** o formulário é enviado com sucesso e uma mensagem de confirmação é exibida.
2. **Given** que o usuário deixa de preencher um campo obrigatório ou insere dados inválidos (como CPF ou email mal formatados), **When** ele tenta submeter o formulário, **Then** o sistema bloqueia o envio e exibe mensagens de erro claras sob os respectivos campos.
3. **Given** que o usuário tenta se cadastrar com um e-mail, CPF ou matrícula que já foram cadastrados na tabela de triagem ou na de monitores, **When** ele submete o formulário, **Then** o sistema exibe uma mensagem de erro informando que os dados já estão em uso.

---

### User Story 2 - Visualização de Candidatos na Triagem (Priority: P2)

Como gestor do LAMPEX, eu quero acessar uma aba dedicada de "Triagem" dentro do painel administrativo para visualizar uma tabela com todos os voluntários pendentes de avaliação.

**Why this priority**: P2. Permite ao gestor gerenciar a fila de candidatos acumulados na triagem de forma centralizada.

**Independent Test**: O gestor faz login e acessa o `ManagerDashboard.vue`. A aba de "Triagem" é renderizada carregando e exibindo uma lista de voluntários cujo status de aprovação é 'Pendente'.

**Acceptance Scenarios**:

1. **Given** que o gestor está devidamente autenticado e no painel administrativo, **When** ele acessa a aba "Triagem", **Then** o sistema realiza uma requisição autenticada com JWT e renderiza a lista de voluntários pendentes na tabela com seus respectivos dados de contato, curso e origem do cadastro.
2. **Given** que não há nenhum voluntário com status 'Pendente' cadastrado, **When** o gestor acessa a aba "Triagem", **Then** a tabela exibe uma mensagem amigável de que não há cadastros pendentes no momento.
3. **Given** que o usuário autenticado não possui a role 'gestor' (é apenas um 'monitor' comum), **When** tenta acessar o painel administrativo ou carregar a aba de triagem, **Then** o sistema não exibe a aba e bloqueia a requisição de carregamento dos dados com código de erro 403.

---

### User Story 3 - Aprovação e Promoção de Candidatos (Priority: P1)

Como gestor do LAMPEX, eu quero aprovar um candidato pendente através de um botão de ação rápida para que ele seja migrado automaticamente e se torne um monitor oficial do sistema.

**Why this priority**: Crítico/P1. É o desfecho do fluxo de triagem, viabilizando a entrada regulamentada de novos monitores no sistema com credenciais de acesso padrão.

**Independent Test**: O gestor clica no botão de aprovação (verde) de um candidato específico na aba de "Triagem". O candidato é removido da lista visual e um novo registro correspondente é inserido na tabela `monitor` com status 'monitor'.

**Acceptance Scenarios**:

1. **Given** um candidato listado na tabela de triagem com status 'Pendente', **When** o gestor clica no botão de aprovar (estilizado em verde institucional `#008744`), **Then** o sistema envia a requisição de aprovação por ID à API, altera o `status_aprovacao` do candidato para 'Aprovado', cria o registro na tabela `monitor` e remove o candidato da listagem visual atual.
2. **Given** que o processo de criação do monitor na tabela `monitor` falhe (ex: violação de constraint), **When** a transação de aprovação é executada, **Then** a operação é cancelada (rollback), nenhuma alteração é feita no banco de dados e o gestor visualiza uma mensagem de erro na tela.

---

### User Story 4 - Rejeição de Candidatos (Priority: P2)

Como gestor do LAMPEX, eu quero rejeitar um candidato pendente através de um botão de ação rápida para que ele seja desconsiderado sem ser promovido a monitor.

**Why this priority**: P2. Permite a limpeza da fila de triagem descartando perfis que não atendem aos critérios de seleção.

**Independent Test**: O gestor clica no botão de rejeição (vermelho) de um candidato específico na aba de "Triagem". O candidato é removido da lista visual e seu status é atualizado para 'Rejeitado' na API.

**Acceptance Scenarios**:

1. **Given** um candidato listado na tabela de triagem com status 'Pendente', **When** o gestor clica no botão de rejeitar (estilizado em vermelho accent `#d62d20`), **Then** o sistema envia a requisição de rejeição à API, atualiza o `status_aprovacao` do candidato para 'Rejeitado' e remove o candidato da listagem visual de pendentes.

---

### Edge Cases

- **Duplicidade Inter-Tabela**: O que acontece se um candidato cadastrado na triagem possuir o mesmo email ou CPF que um monitor já ativo na tabela `monitor`?
  - *Comportamento esperado*: A API deve validar tanto na tabela `potencial_voluntario` quanto na tabela `monitor` antes de permitir o cadastro de triagem, rejeitando duplicidades com erro HTTP 409 (Conflict).
- **Interrupção de Conexão na Migração**: O que acontece se a transação do banco falhar no meio do caminho durante a migração?
  - *Comportamento esperado*: A operação na API deve ser atômica usando transações SQL (`BEGIN`, `COMMIT`, `ROLLBACK`), de forma que o status na tabela `potencial_voluntario` só mude para `'Aprovado'` se a inserção na tabela `monitor` for concluída com absoluto sucesso.
- **Exclusão de Acesso Pós-Exclusão de Token**: O que acontece se a sessão do gestor expirar enquanto a aba de triagem estiver aberta e ele tentar aprovar/rejeitar um candidato?
  - *Comportamento esperado*: A requisição à API retornará status HTTP 401 ou 403. O frontend interceptará esse erro, redirecionará o usuário para a tela de login e exibirá uma notificação de sessão expirada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O subprojeto `/lampex-control-api` deve possuir a tabela `potencial_voluntario` no PostgreSQL com as restrições de unicidade (`email`, `cpf`, `matricula`), valores padrão (`status_aprovacao` como `'Pendente'`), e validações por CHECK para as origens permitidas e os status aceitos.
- **FR-002**: O endpoint `POST /api/voluntarios/cadastro` deve ser público, realizar a validação dos campos obrigatórios e salvar o candidato com `status_aprovacao` igual a `'Pendente'`.
- **FR-003**: O endpoint `GET /api/voluntarios/pendentes` deve exigir autenticação via JWT, validar se o usuário solicitante possui a role `'gestor'` e retornar os registros de voluntários pendentes ordenados por data de cadastro (`created_at`).
- **FR-004**: O endpoint `POST /api/voluntarios/:id/aprovar` deve exigir autenticação via JWT com a role `'gestor'`, atualizar o `status_aprovacao` para `'Aprovado'`, e inserir os dados do voluntário na tabela `monitor` com `role = 'monitor'`, `permite_exibir_contato = false` e gerar uma senha segura criptografada (hash).
- **FR-005**: O endpoint `POST /api/voluntarios/:id/rejeitar` deve exigir autenticação via JWT com a role `'gestor'`, atualizando o `status_aprovacao` para `'Rejeitado'`.
- **FR-006**: O componente visual `CadastroMonitor.vue` no subprojeto `/lampex-control` deve disponibilizar um formulário estilizado e reativo para inserção de dados do candidato, com máscara/validação para CPF, Telefone e Matrícula.
- **FR-007**: O formulário do frontend deve conter um campo select obrigatório com a pergunta: `"Como ficou sabendo do Projeto Lampex?"` contendo as 5 opções exatas: `'Instagram'`, `'Youtube'`, `'Professores ou colegas de turma'`, `'Membros da Equipe Executora do Projeto Lampex'`, `'Avisos do Ifes'`.
- **FR-008**: O painel administrativo `ManagerDashboard.vue` deve conter uma aba "Triagem" acessível apenas a gestores, exibindo a listagem obtida do endpoint de pendentes.
- **FR-009**: Cada linha da listagem na aba "Triagem" deve disponibilizar botões estilizados para Aprovar (Verde `#008744`) e Rejeitar (Vermelho `#d62d20`), que efetuam chamadas assíncronas correspondentes na API e removem o item da tela imediatamente em caso de sucesso.
- **FR-010**: A API deve anexar todos os cabeçalhos de CORS exigidos (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`) em todas as respostas (incluindo `OPTIONS` de pré-vôo) para evitar bloqueios de navegadores.

### Key Entities *(include if feature involves data)*

- **Potencial Voluntário (Tabela `potencial_voluntario`)**:
  - `id`: UUID (Chave primária)
  - `nome`: Texto (Não nulo)
  - `email`: Texto (Único, não nulo)
  - `cpf`: Texto (Único, não nulo)
  - `telefone`: Texto (Não nulo)
  - `curso`: Texto (Não nulo)
  - `matricula`: Texto (Único, não nulo)
  - `origem_cadastro`: Texto restrito a ('Instagram', 'Youtube', 'Professores ou colegas de turma', 'Membros da Equipe Executora do Projeto Lampex', 'Avisos do Ifes')
  - `status_aprovacao`: Texto restrito a ('Pendente', 'Aprovado', 'Rejeitado')
  - `created_at`: Data e hora de criação
- **Monitor (Tabela `monitor`)**:
  - Tabela pré-existente do sistema para usuários cadastrados com permissões. Herdará `nome`, `email`, `telefone`. A role configurada será `'monitor'` e a senha inicial será criptografada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um estudante consegue preencher e enviar o formulário de cadastro de voluntário em menos de 3 minutos.
- **SC-002**: 100% dos cadastros submetidos com sucesso devem ser inseridos na tabela `potencial_voluntario` no banco de dados com status `'Pendente'`.
- **SC-003**: 100% dos voluntários aprovados são migrados com sucesso para a tabela `monitor` com a role `'monitor'` e uma senha segura pré-calculada, e marcados como `'Aprovado'` na tabela de triagem.
- **SC-004**: Nenhuma requisição sem um JWT contendo a role `'gestor'` consegue ler dados da triagem ou aprovar/rejeitar candidatos.
- **SC-005**: Ao clicar em aprovar ou rejeitar, a interface visual do gestor atualiza em menos de 1 segundo (tempo de API + resposta visual do frontend) removendo o candidato processado.

## Assumptions

- **A-001**: O banco de dados PostgreSQL na Aiven possui a extensão `pgcrypto` instalada e disponível para criptografar senhas na tabela `monitor`.
- **A-002**: A senha inicial padrão para o novo monitor será gerada a partir de uma convenção segura, como `Lampex@<matricula>`, permitindo o primeiro login do novo monitor para alteração imediata de senha.
- **A-003**: O gestor padrão `Josué Ramos Souza` (`josue.rsou2@gmail.com`) possui a role `'gestor'` ativa na tabela `monitor` e será utilizado para os testes de autenticação e validação do fluxo de triagem.
- **A-004**: A validação de CPF e telefone no frontend é suficiente para manter a higienização de dados antes da submissão à API.
