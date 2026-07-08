# Feature Specification: Responsividade e Adequação Mobile (Mobile-First)

**Feature Branch**: `006-responsive-mobile-ui`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Criar uma Spec Visual focada em Responsividade e Adequação Mobile (Mobile-First) para todos os componentes do projeto '/lampex-control'. O agente deve refatorar os arquivos Vue e estilos utilitários (Tailwind/CSS) para garantir que o site se adapte perfeitamente a telas pequenas (smartphones e tablets) sem quebras de layout ou transbordamentos horizontais (overflow). Os seguintes ajustes estruturais devem ser aplicados: 1. Na tela 'Login.vue' e 'CadastroMonitor.vue', transformar os layouts de cartões fixos em containers flexíveis ou grids responsivos, empilhando os campos verticalmente em telas menores e ajustando o espaçamento (padding/margin) e o tamanho das fontes de forma fluida. 2. No 'ManagerDashboard.vue', substituir tabelas horizontais largas por cartões empilháveis (cards) ou aplicar rolagem horizontal controlada nas tabelas apenas em dispositivos mobile, evitando que a página inteira quebre. 3. Transformar o menu de navegação superior (Navbar) em um menu responsivo, adaptando os links para uma lista vertical oculta sob um botão de menu (hamburger menu) quando visualizado em telas menores que 768px. 4. Manter a paleta de cores institucional ativa (verde #008744 e vermelho #d62d20), garantindo que os botões de ação e campos de formulário possuam áreas de toque confortáveis (mínimo de 44px de altura) adequadas para navegação por toque."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegação Responsiva no Mobile (Priority: P1)

Como usuário do LampexControl acessando o site de um smartphone ou tablet, eu quero que a barra de navegação principal (Navbar) se adapte a telas menores escondendo os links atrás de um menu hambúrguer, de forma que a interface permaneça limpa e os links não poluam ou quebrem o topo do site.

**Why this priority**: A navegação é o ponto de entrada principal e um elemento persistente na interface. Links quebrando em múltiplas linhas ou vazando para fora da tela inviabilizam o uso de todo o aplicativo em dispositivos móveis.

**Independent Test**: Pode ser testado redimensionando o navegador para uma largura menor que 768px (ou usando ferramentas de emulação mobile). O menu horizontal deve ocultar os links normais e exibir o botão de menu hambúrguer. Clicar no botão hambúrguer deve exibir os links verticalmente e permitir a navegação.

**Acceptance Scenarios**:

1. **Given** que o usuário está em um dispositivo móvel com largura de tela menor que 768px, **When** a página é carregada, **Then** o menu hambúrguer é exibido no topo e a lista de links horizontais é ocultada.
2. **Given** que o menu hambúrguer está fechado em tela menor que 768px, **When** o usuário toca no botão hambúrguer, **Then** a lista vertical de links de navegação é aberta/exibida de forma animada e fluida.
3. **Given** que o menu hambúrguer está aberto em tela menor que 768px, **When** o usuário toca novamente no botão hambúrguer ou fora do menu, **Then** o menu fecha e a lista vertical é ocultada.
4. **Given** que o usuário redimensiona a tela de < 768px para >= 768px, **When** o redimensionamento ocorre, **Then** o botão hambúrguer desaparece e os links horizontais normais voltam a ser exibidos.

---

### User Story 2 - Acesso e Cadastro Simplificados no Mobile (Priority: P1)

Como monitor ou candidato, eu quero acessar o formulário de Login e o formulário de Inscrição/Cadastro a partir do meu smartphone de maneira fluida, visualizando todos os campos organizados verticalmente, com fontes legíveis e botões com tamanhos confortáveis para o toque, para que eu consiga realizar minhas tarefas rapidamente.

**Why this priority**: O login e a inscrição de novos voluntários são fluxos críticos de conversão e entrada de dados. Se o usuário falhar em fazer login ou submeter a ficha por problemas de usabilidade mobile, o sistema perde utilidade.

**Independent Test**: Carregar a página `/login` e a página de cadastro em um celular (ou simulador) com 360px de largura. Verificar se todo o formulário cabe na tela sem exigir rolagem horizontal e se as caixas de texto e os botões têm altura suficiente para tocar sem errar.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa `Login.vue` em uma tela móvel, **When** o formulário é exibido, **Then** o card fixo se expande para preencher as laterais de forma responsiva (com margem mínima de 16px/1rem), as fontes se adaptam proporcionalmente e o botão de login possui altura mínima de 44px.
2. **Given** que o usuário acessa `CadastroMonitor.vue` em uma tela móvel, **When** a tela é inferior a 768px, **Then** os campos dispostos originalmente lado a lado na grid de duas colunas (ex: CPF e Matrícula, E-mail e Telefone) passam a empilhar verticalmente em uma coluna única, e o espaçamento lateral (padding) do card diminui para maximizar a área útil dos inputs.

---

### User Story 3 - Visualização Responsiva do Painel do Gestor (Priority: P2)

Como coordenador do LAMPEX, eu quero auditar relatórios e realizar a triagem de candidatos no meu tablet ou smartphone de forma organizada, visualizando as tabelas em formato adaptado de cartões (cards) ou com rolagem lateral controlada, para que o layout geral da página não quebre.

**Why this priority**: Os gestores usam mais frequentemente computadores, mas devem ter a capacidade de verificar status e realizar aprovações rápidas em trânsito de forma aceitável em tablets e celulares de tela média.

**Independent Test**: Acessar o `ManagerDashboard.vue` em modo mobile, alternar entre as abas e validar que a listagem de candidatos na triagem e a fila de relatórios na auditoria adaptam-se para cards ou possuem áreas de rolagem bem definidas, sem distorcer o layout global do site.

**Acceptance Scenarios**:

1. **Given** que o gestor acessa a aba "Triagem de Voluntários" em uma tela com menos de 768px, **When** a lista de candidatos é carregada, **Then** a tabela horizontal é substituída por uma exibição de cartões empilháveis onde cada candidato tem seus dados (nome, matrícula, curso, origem) agrupados de forma vertical e organizada, contendo botões de ação bem visíveis de Aprovar/Rejeitar.
2. **Given** que o gestor acessa a aba "Fila de Auditoria" em uma tela com menos de 768px, **When** a página é desenhada, **Then** o painel em duas colunas (Listagem e Visualizador PDF) se empilha de forma que o PDF seja reposicionado de forma legível ou fique acessível por um botão/link externo alternativo, evitando que a largura de 600px fixe ou quebre o layout da página.

---

### Edge Cases

- **Telas ultrapequenas (Ex: 320px de largura - iPhone SE)**: O layout do menu hambúrguer, o logotipo da instituição e os formulários de cadastro devem continuar utilizáveis sem transbordamento lateral de texto ou sobreposição de botões de ação.
- **Rotação de Tela (Portrait vs Landscape)**: O layout deve recalcular e adaptar instantaneamente a navbar e as grids responsivas ao rotacionar o dispositivo entre os modos retrato e paisagem.
- **Iframe de PDF de relatórios na Auditoria**: Se o iframe do PDF de 600px de altura for exibido em celulares de 320px-375px, ele pode empurrar o conteúdo muito para baixo ou ficar ilegível. Deve haver uma verificação de tamanho de tela que oculte o iframe invasivo ou substitua a visualização inline por um botão "Visualizar PDF" que abra o arquivo em uma nova aba do navegador em dispositivos pequenos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE implementar uma barra de navegação responsiva (Navbar) em `App.vue`, que oculte os links comuns e exiba um botão de menu hambúrguer quando a largura da viewport for menor que 768px.
- **FR-002**: O menu hambúrguer responsivo DEVE exibir a lista de links verticalmente abaixo do cabeçalho da navbar quando ativado por clique/toque, utilizando transições suaves para abrir e fechar.
- **FR-003**: Os botões de ação principais, links do menu móvel e campos de entrada de formulários (inputs, selects, textareas) DEVEM possuir uma área de toque ativa com altura mínima de 44px para garantir a ergonomia no toque em telas mobile.
- **FR-004**: Nas telas `Login.vue` e `CadastroMonitor.vue`, os estilos de cartões com larguras fixas em pixels DEVEM ser substituídos por contêineres fluidos usando classes responsivas ou regras de media-queries que permitam largura de 100% com margens flexíveis (ex: `padding: 1rem` no mobile e `2.5rem` no desktop).
- **FR-005**: Na tela `CadastroMonitor.vue`, as grids com layout horizontal de duas colunas (`responsive-grid-2`) DEVEM ser configuradas para empilhar em uma única coluna vertical abaixo de 768px.
- **FR-006**: No `TriagemPanel.vue`, a tabela horizontal larga contendo dados dos voluntários DEVE ser ocultada em viewports menores que 768px e substituída por um layout de cartões empilhados (cards), onde cada cartão contém os detalhes organizados do voluntário e botões de ação verticais e acessíveis.
- **FR-007**: No `AuditPanel.vue`, o painel lateral de exibição do PDF do relatório (iframe de 600px) DEVE ser ocultado em telas menores que 768px, sendo substituído por um link ou botão proeminente "Abrir Relatório em Nova Aba" (`target="_blank"`) para evitar esmagamento do layout e consumo desnecessário de espaço de tela.
- **FR-008**: O design DEVE assegurar que a barra de rolagem horizontal global (overflow-x) nunca apareça na janela principal do navegador, garantindo que o viewport horizontal se limite a 100% da tela em qualquer dispositivo.
- **FR-009**: Os estilos modificados DEVEM respeitar estritamente a paleta de cores institucional, utilizando a cor principal verde (`#008744`) para botões de sucesso/aprovação/navegação ativa, e vermelho (`#d62d20`) para botões de recusa/cancelamento/alertas, mantendo o contraste necessário de acessibilidade.

### Key Entities *(include if feature involves data)*

- **NavbarState**: Estado de interface que controla se o menu móvel expandido está aberto ou fechado (valores booleanos).
- **CandidateCardState**: Estado e componentes de interface correspondentes à representação visual de cada voluntário em formato de cartão no mobile, mapeando os atributos nome, curso, matrícula, data de inscrição e origem de cadastro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero pixels de overflow horizontal (rolagem horizontal da página inteira) em qualquer resolução de tela simulada entre 320px e 1440px.
- **SC-002**: 100% das áreas de toque críticas de navegação e formulários (inputs de texto, botões de envio, botões de ação na triagem/auditoria, links do menu hambúrguer) medindo pelo menos 44px de altura/largura.
- **SC-003**: O menu hambúrguer abre e fecha em menos de 200ms após o toque, sem atrasos visíveis na transição da interface.
- **SC-004**: Carregamento adequado e tempo de repintura do layout (Cumulative Layout Shift - CLS) inferior a 0.1 nas transições de colapso/expansão de telas e rotação.

## Assumptions

- **A-001**: Dispositivos móveis que acessam o sistema possuem suporte nativo a CSS Grid, Flexbox e media-queries.
- **A-002**: Os relatórios em formato PDF armazenados nas URLs são públicos ou possuem tokens de acesso válidos para abertura direta em nova aba pelo navegador do dispositivo móvel.
- **A-003**: O Tailwind CSS ou CSS utilitário global está integrado de forma a ser editado diretamente em `src/style.css` ou por meio de classes utilitárias scoped nos componentes Vue sem quebrar outros layouts do desktop.
