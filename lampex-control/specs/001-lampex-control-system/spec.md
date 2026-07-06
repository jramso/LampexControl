# Feature Specification: LampexControl

**Feature Branch**: `001-lampex-control-system`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "um site expositivo como Home e Um sistema de gerenciamento e controle chamado LampexControl para o laboratório LAMPEX, focado em automatizar o fluxo de monitorias, o registro semanal de atividades dos voluntários e o processo de auditoria de horas pela gestão. O objetivo é eliminar o retrabalho de envios duplicados de formulários, centralizar arquivos de relatórios e evidências de execução com segurança, cruzar disponibilidades de horários dos membros para reuniões de alinhamento por meio de um mapa de calor, e aplicar automaticamente os pesos e multiplicadores de horas para cada tipo de atividade (como monitorias e minicursos) conforme o regulamento interno, gerando relatórios consolidados prontos para o sistema de certificação institucional"

## Clarifications

### Session 2026-07-06
- Q: Como deve ser controlado o acesso para leitura e download dos arquivos e relatórios PDF enviados? → A: Restrito ao Proprietário e Gestão (Apenas o monitor que enviou o arquivo e a coordenação podem acessar os documentos).
- Q: Qual é o tempo de resposta máximo (latência) alvo para as requisições normais da API (leituras e escritas, excluindo uploads de arquivos grandes)? → A: Tempo de resposta de até 2.0s (sem metas de performance extremas, priorizando a simplicidade).
- Q: Qual mecanismo de autenticação deve ser adotado para Monitores e Gestão acessarem o LampexControl? → A: E-mail e Senha com JWT (autenticação autocontida integrada ao PostgREST para mapeamento de roles do banco).
- Q: Como as ações de auditoria (aprovação/rejeição de horas pela gestão) devem ser registradas no sistema? → A: Histórico contendo a identificação do gestor, permitindo que os gestores atualizem ou excluam esses registros históricos de auditoria.
- Q: Devemos definir limites formais de taxa (Rate Limiting) para as requisições públicas para proteger o banco de dados contra sobrecarga ou tentativas de força bruta? → A: Rate Limiting Ativo nas Rotas Públicas (limite geral de 60 req/min por IP nas rotas públicas, e 5 req/min nas rotas de login/autenticação).





## User Scenarios & Testing *(mandatory)*

### User Story 1 - Solicitação e Agendamento de Monitorias (Priority: P1)
Como **Aluno (Solicitante)**, desejo solicitar monitorias informando meus dados cadastrais, descrição de dúvidas e disponibilidades de horário, para que eu possa receber atendimento presencial ou online e visualizar os dados de contato do monitor assim que a solicitação for confirmada.

**Why this priority**: É a porta de entrada para a prestação de serviços do laboratório e indispensável para a coleta de dados de certificação institucional.

**Independent Test**: Pode ser testado ponta a ponta criando um chamado de monitoria via formulário e verificando a geração da solicitação pendente no sistema. Após simulação de confirmação pela gestão, valida-se se as informações de contato do monitor ficam visíveis ao aluno respeitando as configurações de privacidade do monitor.

**Acceptance Scenarios**:
1. **Given** que o aluno acessa o formulário de monitoria, **When** preenche todos os campos obrigatórios (Nome, E-mail, Telefone, Data de Nascimento, CPF, descrição da dúvida, formato e horários livres) e submete, **Then** o sistema gera uma solicitação de monitoria com status "Pendente".
2. **Given** uma solicitação com status "Pendente", **When** o aluno tenta visualizar os dados de contato do monitor, **Then** o sistema oculta os detalhes de contato, exibindo apenas que o agendamento está aguardando confirmação.
3. **Given** que a gestão confirmou o agendamento de uma monitoria, **When** o aluno consulta o status do agendamento, **Then** o sistema exibe os dados de contato configurados pelo monitor (ex. número de WhatsApp ou perfil de rede social/plataforma de comunicação) de acordo com o nível de privacidade por ele parametrizado.

---

### User Story 2 - Registro de Disponibilidade e Submissão Semanal de Atividades (Priority: P1)
Como **Monitor (Voluntário ou Bolsista)**, desejo preencher minha grade de disponibilidade individual e enviar semanalmente meus relatórios de atividades consolidados contendo múltiplos itens de atividades com suas respectivas evidências e relatórios em PDF, para que minhas horas líquidas sejam computadas e auditadas sem retrabalho.

**Why this priority**: É o fluxo primário de trabalho dos monitores e a base para a certificação de suas horas de atividades.

**Independent Test**: Pode ser testado preenchendo a matriz de disponibilidade semanal, definindo as opções de privacidade de contato, e enviando um fluxo de registro semanal contendo mais de uma atividade, um PDF de relatório e um link de evidência, verificando o cálculo correto das horas líquidas e o status pendente para auditoria.

**Acceptance Scenarios**:
1. **Given** que o monitor acessa sua tela de perfil, **When** preenche a matriz de disponibilidade (Dias da Semana x Blocos de Horários) com opções de atendimento (Presencial, Online ou Indisponível), **Then** o sistema salva os multiplicadores (1.0 para Presencial, 0.5 para Online e 0.0 para Indisponível) no registro do monitor.
2. **Given** que o monitor deseja alterar suas configurações de privacidade, **When** ele ativa ou desativa a exibição de suas informações de contato (ex. WhatsApp), **Then** o sistema atualiza a preferência de privacidade imediatamente.
3. **Given** que o monitor acessa a tela de registro de atividades, **When** seleciona a semana de referência, adiciona múltiplos itens de atividades (ex. 2 horas de Monitoria e 3 horas de Minicurso com Material), faz o upload do PDF (modelo Proex) e fornece um link de evidência (ex. commits do GitHub), **Then** o sistema consolida o registro, calcula automaticamente as horas líquidas com base na tabela de pesos do LAMPEX e salva o status como "Aguardando Auditoria".

---

### User Story 3 - Painel de Gestão: Auditoria de Horas, Mapa de Calor e Exportação (Priority: P2)
Como **Gestor (Equipe de Execução ou Coordenação)**, desejo visualizar e auditar os registros de atividades dos monitores, analisar o mapa de calor de disponibilidade dos membros para reuniões e exportar relatórios de certificação institucional em lote, para simplificar e garantir a conformidade do processo de certificação.

**Why this priority**: Melhora a eficiência operacional da gestão, reduzindo o tempo de conferência manual e o risco de inconsistências na homologação das horas.

**Independent Test**: Pode ser testado acessando o painel de gestão, aprovando ou rejeitando relatórios em lote, verificando a renderização correta do mapa de calor de horários a partir das disponibilidades dos monitores e gerando o arquivo consolidado de exportação para o sistema SRC do Ifes.

**Acceptance Scenarios**:
1. **Given** que o gestor acessa a fila de auditoria de horas, **When** visualiza o relatório em PDF e o link de evidência lado a lado para um lote de registros, e clica em aprovar, **Then** o status dos registros é alterado para "Aprovado" e as horas líquidas são somadas ao saldo de certificação do monitor.
2. **Given** que o gestor acessa a tela do Mapa de Calor, **When** o sistema lê as matrizes de disponibilidade de todos os monitores ativos, **Then** exibe de forma visual os dias e horários com maior sobreposição de membros disponíveis (multiplicadores maiores que 0).
3. **Given** que o gestor seleciona um período de certificação, **When** clica em exportar dados para o SRC, **Then** o sistema gera um arquivo contendo os dados formatados dos voluntários e alunos atendidos conforme o padrão do Ifes.

---

### Edge Cases

- **Envio de Relatório sem Evidência Obrigatória**: Caso o monitor preencha o registro de horas mas falhe em anexar o PDF de atividades (Modelo Proex) ou em fornecer o link de evidência, o sistema deve impedir a submissão e exibir uma mensagem de erro clara alertando sobre os anexos obrigatórios.
- **Conflito de Registro Semanal**: Se o monitor tentar enviar um novo registro semanal para uma semana de referência que já possua um registro submetido e ainda pendente ou aprovado, o sistema deve avisar que já existe uma submissão para aquela semana e oferecer a opção de atualizar a submissão existente em vez de criar um duplicado.
- **Tratamento de Privacidade em Agendamentos Cancelados**: Se um agendamento for cancelado pela gestão após ter sido confirmado, as informações de contato do monitor devem ficar imediatamente invisíveis para o aluno associado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que a comunidade externa (alunos) solicite monitoria fornecendo Nome, E-mail, Telefone, Data de Nascimento, CPF (obrigatório para fins de certificação), descrição da dúvida, formato da monitoria (Presencial/Online) e disponibilidade de dias/horários.
- **FR-002**: O sistema MUST fornecer ao monitor uma matriz visual para registrar sua disponibilidade semanal, atribuindo pesos automáticos para monitoria presencial (1.0), online (0.5) e indisponível (0.0).
- **FR-003**: O sistema MUST permitir que o monitor parametrizar a privacidade de suas informações de contato (ex. WhatsApp) para alunos com agendamentos confirmados.
- **FR-004**: O sistema MUST fornecer um fluxo unificado de registro semanal onde o monitor adiciona múltiplos itens de atividade por semana de referência, com upload obrigatório de relatório em PDF e link de evidência.
- **FR-005**: O sistema MUST calcular automaticamente as horas líquidas ao salvar um registro de atividade, aplicando os seguintes multiplicadores baseados na tabela de pesos do LAMPEX:
  - Monitorias: Horas praticadas * 2.
  - Minicurso com Material: Horas de aula * 3.
  - Minicurso sem Material: Horas de videoaula * 2.5.
  - Marketing Digital: 2 horas fixas por publicação (Story/Reel/Feed) e 4 horas fixas para estruturação/melhoria de perfil.
  - Desenvolvimento de Software / Outros: Horas líquidas parametrizáveis definidas individualmente pela gestão.
- **FR-006**: O sistema MUST implementar uma trava de segurança que não compute automaticamente horas de reuniões de planejamento comuns na carga horária líquida, exceto se marcadas manualmente pela gestão.
- **FR-007**: O sistema MUST fornecer à coordenação uma interface de auditoria side-by-side de relatórios e links de evidência, permitindo aprovação ou rejeição de registros de atividades em lote.
- **FR-008**: O sistema MUST consolidar e exibir um Mapa de Calor dinâmico indicando as melhores janelas de horário para reuniões gerais, com base nas disponibilidades registradas pelos monitores.
- **FR-009**: O sistema MUST exportar em lote os relatórios formatados contendo dados dos voluntários e alunos para fins de cadastro no sistema SRC do Ifes.
- **FR-010**: O sistema MUST restringir a leitura e download dos relatórios em PDF e evidências enviados apenas ao monitor proprietário do registro e aos gestores do laboratório.
- **FR-011**: O sistema MUST autenticar os perfis de Monitor e Gestão utilizando credenciais de E-mail e Senha, gerando tokens JWT compatíveis com a autorização nativa do PostgREST.
- **FR-012**: O sistema MUST registrar o histórico de auditoria contendo a identificação do gestor responsável, data/hora e justificativa para cada aprovação/rejeição, permitindo que gestores atualizem ou excluam esses registros históricos quando necessário.
- **FR-013**: O sistema MUST implementar limitação de taxa (rate limiting) nas rotas públicas (máximo de 60 requisições por minuto por IP) e de autenticação (máximo de 5 tentativas de login por minuto por IP) para proteção do banco de dados e controle de abuse.





### Key Entities *(include if feature involves data)*

- **SolicitacaoMonitoria**: Representa a solicitação de monitoria enviada pelo aluno. Atributos: ID, NomeAluno, EmailAluno, TelefoneAluno, CPFAluno, DescricaoDuvida, Formato (Presencial/Online), HorariosDisponiveis (JSON/Array), Status (Pendente/Confirmado/Cancelado), MonitorResponsavelID.
- **Monitor**: Representa o voluntário ou bolsista do laboratório. Atributos: ID, Nome, Email, Telefone, PermiteExibirContato (Boolean), PlataformaContato (ex: WhatsApp/Discord), MatrizDisponibilidade (JSON).
- **RegistroSemanal**: Representa a submissão consolidada de atividades de uma semana. Atributos: ID, MonitorID, SemanaReferencia (Date/String), ArquivoPDFUrl, StatusAuditoria (Pendente/Aprovado/Recusado), JustificativaGestao, ItensAtividade (JSON/Array).
- **ItemAtividade**: Sub-entidade do registro semanal representando uma atividade individual. Atributos: ID, TipoAtividade (Monitoria, Minicurso, Marketing, Dev, Outros), HorasBrutas, HorasLiquidas, EvidenciaUrl.
- **HistoricoAuditoria**: Representa a ação histórica de auditoria de um registro de atividades por um gestor. Atributos: ID, RegistroSemanalID, GestorID, StatusAuditoria (Aprovado/Recusado), Justificativa, DataHoraAcao.


## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O tempo necessário para a gestão consolidar e validar as horas mensais de um voluntário deve ser reduzido em pelo menos 70% em comparação com o processo de planilha manual.
- **SC-002**: Reduzir a zero (0%) a incidência de registros semanais duplicados por meio da validação e fluxo unificado por semana de referência.
- **SC-003**: 100% das horas líquidas calculadas pelo sistema devem seguir rigorosamente os multiplicadores do regulamento do LAMPEX, sem erros de arredondamento.
- **SC-004**: O mapa de calor de disponibilidade deve ser gerado e atualizado de forma instantânea (menos de 2 segundos de carregamento) sempre que consultado pelo coordenador.
- **SC-005**: O tempo de resposta das consultas e transações comuns da API PostgREST deve se manter abaixo de 2,0 segundos sob condições normais de uso do laboratório.


## Assumptions

- **A-001**: O sistema de certificação institucional do Ifes (SRC) aceita importação de dados em formatos comuns (como CSV ou XLSX).
- **A-002**: Os monitores e gestores terão acesso à internet estável para realizar o upload de documentos PDF e links de evidência.
- **A-003**: As reuniões de planejamento comuns, embora tenham peso zero por padrão, são registradas no sistema para fins de controle de frequência de reuniões gerais de alinhamento.
- **A-004**: O armazenamento de relatórios em PDF será tratado de forma segura, garantindo privacidade de dados conforme a LGPD.
