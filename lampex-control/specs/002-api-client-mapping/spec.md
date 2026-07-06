# Feature Specification: Mapeamento de Chamados da API

**Feature Branch**: `[002-api-client-mapping]`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Segunda Spec do LampexControl focada no mapeamento de chamados da API via PostgREST. Criação do arquivo de serviços em TypeScript para gerenciar requisições POST para /solicitacoes_monitoria (coletando dados obrigatórios do aluno conforme a LGPD) e /registro_horas (permitindo múltiplos lançamentos de atividades por semana de referência com anexos de arquivos e links). Inclusão de requisições GET para as views de agregação, consumindo /view_reuniao_geral para retornar a matriz consolidada de planejamento e /view_contato_monitor para obter as informações de WhatsApp ou nome de perfil autorizadas pelo monitor para agendamentos validados."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registro de Solicitação de Monitoria sob a LGPD (Priority: P1)

Como aluno precisando de auxílio nas disciplinas, quero registrar um chamado de monitoria informando meus dados de contato e documento para agendar um atendimento de forma segura.

**Why this priority**: Crítico para permitir a entrada de novas solicitações de monitoria acadêmica no laboratório de forma regulamentar.

**Independent Test**: Submeter o formulário informando todos os dados obrigatórios e verificar que a solicitação é gravada no sistema gerando um número de protocolo (ID único).

**Acceptance Scenarios**:

1. **Given** um aluno na página de solicitações, **When** preenche Nome, E-mail, Telefone, CPF e Data de Nascimento e clica em enviar, **Then** o sistema gera um protocolo ativo com status "Pendente".
2. **Given** um formulário em preenchimento, **When** o aluno deixa de preencher o CPF ou a Data de Nascimento, **Then** o sistema impede a submissão e avisa sobre a obrigatoriedade dos dados.

---

### User Story 2 - Registro Semanal de Múltiplas Atividades (Priority: P1)

Como monitor acadêmico do LAMPEX, quero registrar todas as minhas atividades da semana de referência de forma consolidada, inserindo links de evidências e anexando o relatório de comprovação.

**Why this priority**: Garante o fluxo principal de alimentação das horas de bolsistas e voluntários para fins de certificação mensal.

**Independent Test**: Enviar um relatório consolidado com três atividades de categorias distintas para uma mesma semana e verificar que todas foram vinculadas corretamente à semana de referência.

**Acceptance Scenarios**:

1. **Given** um monitor autenticado na área restrita, **When** preenche a semana de referência, insere o link do PDF Proex e adiciona 3 tarefas com seus respectivos links de evidência, **Then** o sistema grava todo o conjunto em uma transação única e atômica.
2. **Given** um monitor tentando submeter atividades, **When** tenta enviar sem o link do relatório PDF principal, **Then** o sistema rejeita o envio e solicita o documento obrigatório.

---

### User Story 3 - Consulta de Disponibilidade e Contatos Autorizados (Priority: P2)

Como gestor da coordenação ou aluno com agendamento confirmado, quero consultar as views agregadas de planejamento e contatos dos monitores.

**Why this priority**: Facilita a marcação de reuniões gerais pela coordenação e viabiliza a comunicação direta entre aluno e monitor após a confirmação da monitoria, respeitando as escolhas de privacidade.

**Independent Test**: Consultar a disponibilidade geral para reuniões e buscar as informações de WhatsApp de um monitor a partir de um agendamento com status "Confirmado".

**Acceptance Scenarios**:

1. **Given** a coordenação acessando o painel gestor, **When** carrega a aba de reuniões, **Then** visualiza a matriz ponderada de disponibilidade agregada de todos os monitores por dia e bloco.
2. **Given** um chamado com status "Confirmado" e monitor com privacidade ativa, **When** o aluno consulta pelo seu CPF, **Then** o sistema exibe o nome do monitor e o seu link direto de WhatsApp.
3. **Given** um chamado com status "Pendente", **When** o aluno tenta acessar a página de status, **Then** as informações de telefone e contato do monitor permanecem totalmente ocultadas.

---

### Edge Cases

- **Duplicidade de Registro Semanal**: Se o monitor tentar enviar um relatório de atividades para uma semana que já possui registro ativo, o sistema deve recusar a submissão e apresentar um erro de duplicidade.
- **CPF Malformado**: Se o CPF do aluno contiver menos de 11 dígitos ou caracteres especiais não tratados, o sistema deve impedir a requisição antes de enviá-la para a API.
- **Inexistência de Monitor Associado**: Se um chamado for confirmado sem que nenhum monitor seja atribuído como responsável, a consulta de contatos deve retornar que o atendimento está sem monitor alocado, sem causar falhas de carregamento.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST expor um canal de integração para criação de chamados em `/solicitacoes_monitoria`, exigindo Nome, E-mail, Telefone, CPF e Data de Nascimento do aluno.
- **FR-002**: Para conformidade com a LGPD, o sistema MUST armazenar CPF e Data de Nascimento do aluno de forma restrita a consultas autorizadas, não os expondo em listagens públicas.
- **FR-003**: O sistema MUST expor um método de submissão em lote para `/registro_horas`, integrando a semana de referência, o link do arquivo do relatório Proex e uma coleção dinâmica de atividades com seus links de evidência.
- **FR-004**: O sistema MUST disponibilizar uma view de leitura em `/view_reuniao_geral` que consolida os pesos de disponibilidade de todos os monitores ativos.
- **FR-005**: O sistema MUST disponibilizar uma view de leitura em `/view_contato_monitor` para retornar o meio de contato autorizado do monitor apenas se o chamado correspondente estiver com status "Confirmado" e o monitor tiver permitido a exibição em suas configurações de privacidade.

### Key Entities

- **SolicitacaoMonitoria**: Representa o chamado aberto pelo aluno. Atributos chave: Nome do Aluno, E-mail, Telefone, CPF, Data de Nascimento, Descrição da Dúvida, Formato (Presencial/Online), Horários e Status (Pendente/Confirmado/Cancelado).
- **RegistroSemanal**: Representa a folha de ponto semanal do monitor. Atributos chave: Semana de Referência, Link do PDF comprobatório e lista de itens de atividades praticadas.
- **ItemAtividade**: Item individual contido no registro semanal. Atributos chave: Tipo de Atividade, Horas Brutas e Link da Evidência.
- **DisponibilidadeAgregada**: View de agregação contendo Dia da Semana, Bloco de Horário e Peso Total Somado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O formulário de solicitação de monitoria deve ser preenchido e submetido com sucesso por alunos em menos de 3 minutos.
- **SC-002**: 100% das submissões de relatórios semanais que contenham múltiplos itens de atividade devem ser processadas como transações únicas e salvas sem perda de integridade.
- **SC-003**: A matriz de reuniões gerais deve consolidar e carregar as cores do mapa de calor em menos de 1,5 segundos.
- **SC-004**: A segurança de privacidade deve ocultar completamente o telefone do monitor em 100% dos chamados que não estejam explicitamente no status "Confirmado".

## Assumptions

- **A-001**: O upload de comprovantes em PDF se dará por links externos de storage já resolvidos, não havendo necessidade de processar binários diretamente na API PostgREST.
- **A-002**: A validação de conformidade da LGPD dar-se-á pela retenção de dados cadastrais sensíveis somente para fins administrativos e de certificação.
- **A-003**: A visualização `/view_reuniao_geral` consome a matriz consolidada no banco gerada a partir dos perfis dos monitores.
