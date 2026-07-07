# Feature Specification: UI Theme Redesign

**Feature Branch**: `005-ui-theme-redesign`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Ler a especificação de design institucional em specs/ui-theme-spec.md baseada no IFES e LAMPEX. Atualizar os estilos globais do frontend para adotar estritamente a nova paleta: fundo branco puro (#ffffff), cor primária verde institucional (#008744) para botões principais, headers e bordas de foco, e cor de destaque vermelha (#d62d20) para badges de 'gestor', notificações de erro e indicadores críticos. Garantir que os componentes Login.vue e ManagerDashboard.vue apliquem estas variáveis CSS/Tailwind, removendo qualquer padrão antigo de cores azul ou cinza escuro, alinhando a interface perfeitamente com os logotipos do laboratório."

## Clarifications

### Session 2026-07-07

- Q: Onde estão localizados os logotipos e ícones oficiais do IFES e do LAMPEX no repositório? → A: Na pasta 'assets' do projeto frontend, com os caminhos `assets/ifes_icon.png` e `assets/lampex_icon.jpg`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acesso com Tema Institucional no Login (Priority: P1)

Como qualquer usuário (monitor, gestor ou coordenador), ao acessar a tela de Login, quero que o design reflita a identidade visual do IFES e do LAMPEX (fundo branco puro, verde institucional para o botão e foco, vermelho para erros e mensagens críticas), para que eu tenha uma experiência visual profissional e coerente com a instituição.

**Why this priority**: A tela de login é a porta de entrada para todos os usuários do sistema. Garantir uma experiência visual institucional nesta etapa inicial é crítico para a confiabilidade e credibilidade da ferramenta.

**Independent Test**: Pode ser totalmente testado de forma independente acessando a rota `/login`, validando o layout, verificando as cores de fundo, botão de ação, bordas de foco dos campos de e-mail/senha, e provocando um erro de autenticação para validar a cor da mensagem.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa a página de Login, **When** a página é renderizada, **Then** o fundo da tela deve ser branco absoluto (`#ffffff`), o botão de ação "Entrar no Sistema" deve ser preenchido em verde primário (`#008744`) com texto em branco (`#ffffff`), e o logotipo deve estar centralizado no topo.
2. **Given** o botão de login visível, **When** o usuário posiciona o cursor do mouse sobre o botão (`:hover`), **Then** a cor de fundo do botão deve transicionar de forma suave para o verde primário escuro (`#005c2e`).
3. **Given** os campos de formulário (e-mail e senha) com bordas cinza padrão (`#d1d7d1`), **When** o usuário clica ou foca em um dos campos, **Then** a borda do campo deve mudar para verde primário (`#008744`) acompanhado de um contorno (outline) suave.
4. **Given** que o usuário preenche dados incorretos e tenta fazer o login, **When** o erro de autenticação é retornado, **Then** a mensagem de erro deve ser exibida abaixo do formulário na cor vermelha destaque (`#d62d20`).

---

### User Story 2 - Visualização do Painel de Gestão Consolidado (Priority: P2)

Como gestor do LAMPEX, ao acessar o dashboard, quero ver a barra superior (Navbar), as tabelas de monitoria, abas de navegação e badges estilizados estritamente nas cores verde e vermelha institucional, eliminando completamente os tons antigos de azul ou roxo escuro, para operar o painel de forma clara e visualmente limpa.

**Why this priority**: O dashboard do gestor reúne as informações mais importantes de auditoria de horas e visualização de dados. A padronização de cores garante foco visual nas ações administrativas sem distrações visuais ou inconsistências do tema escuro anterior.

**Independent Test**: Pode ser testado fazendo login como gestor, navegando para a rota do dashboard do gestor (`/manager-dashboard`), e inspecionando visualmente se não há elementos com tons degradês de azul ou roxo, garantindo que a barra superior e as abas reflitam as novas diretrizes.

**Acceptance Scenarios**:

1. **Given** que o gestor acessa o painel, **When** o dashboard é carregado, **Then** a barra superior de navegação (Navbar) deve ter fundo em verde primário (`#008744`) com texto branco (`#ffffff`).
2. **Given** a tabela ou lista de monitores e horas, **When** as permissões dos usuários são renderizadas, **Then** o badge correspondente ao papel `gestor` deve ter fundo vermelho destaque (`#d62d20`) com texto em branco, e o badge de `monitor` deve ter fundo verde primário (`#008744`) com texto em branco.
3. **Given** as abas de navegação ("Fila de Auditoria" e "Mapa de Calor"), **When** uma aba estiver selecionada/ativa, **Then** seu indicador deve ser exibido na cor verde primário (`#008744`), e quando inativa deve exibir texto escuro (`#1a1a1a`) ou cinza.
4. **Given** o botão de ação principal "Exportar para o SRC" no painel, **When** visualizado, **Then** ele deve ter o fundo verde primário (`#008744`) e mudar para verde escuro (`#005c2e`) no hover, seguindo o padrão global de botões.

---

### User Story 3 - Coesão Visual nas Demais Telas e Componentes Secundários (Priority: P3)

Como membro do LAMPEX (monitor ou gestor), quero que toda a navegação e elementos de interface globais (links, tabelas, inputs e contornos) adotem as variáveis institucionais, de forma que o sistema apresente um tema claro coeso em qualquer fluxo de uso.

**Why this priority**: Garante que o usuário final não encontre telas obsoletas ou inconsistências de transição de cores enquanto realiza tarefas cotidianas.

**Independent Test**: Navegar por fluxos alternativos, como o perfil do monitor ou o histórico de registros semanais, e garantir que as cores de foco, inputs, fundo principal e secundário estejam aplicando estritamente as novas variáveis de cor de maneira homogênea.

**Acceptance Scenarios**:

1. **Given** que o usuário está em qualquer página do sistema, **When** a página é renderizada, **Then** o fundo principal (`--color-bg-main`) deve ser branco puro (`#ffffff`) e fundos de tabelas ou inputs desabilitados devem ser cinza sutil (`#f4f6f4`).
2. **Given** divisores de tabelas ou bordas de caixas de texto, **When** exibidos, **Then** eles devem utilizar a cor de borda institucional (`#d1d7d1`).

---

### Edge Cases

- **Compatibilidade com Modo Escuro do Sistema Operacional ou Navegador**: O sistema deve forçar estritamente o tema institucional claro (`#ffffff`) baseado no IFES e LAMPEX. Caso o navegador do usuário tenha preferências de modo escuro ativas, o sistema deve ignorar o modo escuro automático para não descaracterizar a identidade de cores institucional estabelecida.
- **Destaque Crítico em Indicadores de Erro**: O vermelho de destaque (`#d62d20`) deve ser usado unicamente para badges de gestores, mensagens de erro e indicadores críticos, evitando que sua utilização em excesso polua a interface ou perca o sentido de urgência visual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST adotar uma paleta de cores institucional baseada no IFES e LAMPEX, contendo as variáveis:
  - Fundo Principal (`--color-bg-main`): Branco puro (`#ffffff`)
  - Fundo Secundário (`--color-bg-subtle`): Cinza claro institucional (`#f4f6f4`)
  - Primária (`--color-primary`): Verde institucional (`#008744`)
  - Primária Dark (`--color-primary-dark`): Verde escuro (`#005c2e`)
  - Destaque (`--color-accent`): Vermelho destaque (`#d62d20`)
  - Texto Escuro (`--color-text-dark`): Cinza escuro/preto (`#1a1a1a`)
  - Texto Claro (`--color-text-light`): Branco (`#ffffff`)
  - Bordas (`--color-border`): Cinza claro (`#d1d7d1`)
- **FR-002**: O sistema MUST redefinir os estilos globais de formulários e caixas de entrada de texto no arquivo `src/style.css` para que as bordas ativas de foco utilizem a cor primária verde (`#008744`).
- **FR-003**: O componente `Login.vue` MUST ser atualizado para remover o estilo de cartão de vidro escuro (`glass-card` com fundo translúcido escuro) e adotar fundo branco absoluto com os botões e focos alinhados ao verde primário, e mensagens de erro no vermelho destaque.
- **FR-004**: O componente `ManagerDashboard.vue` (e seus subcomponentes relacionados `AuditPanel.vue` e `MeetingHeatmap.vue`) MUST ser atualizado para remover degradês ou cores azuis/roxas antigas (como `--accent-cyan` e `--accent-purple`), garantindo que a navegação por abas e barra superior adotem o verde primário.
- **FR-005**: Os badges de cargos do sistema MUST aplicar as cores de destaque institucional: o cargo `gestor` deve usar fundo vermelho destaque (`#d62d20`) com texto em branco, e o cargo `monitor` deve usar fundo verde primário (`#008744`) com texto em branco.

### Key Entities *(include if feature involves data)*

- **VisualTheme**: Entidade que encapsula a configuração estética da interface do sistema, responsável por fornecer os tokens de cor de fundo, cores primárias para botões/headers, cores secundárias para estados interativos e cores de realce para notificações e badges de níveis de acesso.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O frontend adota 100% da nova paleta de cores, com zero ocorrências de tons de azul (`#06b6d4`, `--accent-cyan`) ou roxo (`#8b5cf6`, `--accent-purple`) nas telas de login e painel de gestão.
- **SC-002**: O contraste entre o texto e o fundo em botões principais e badges coloridos atende ao padrão de acessibilidade WCAG AA (proporção de contraste mínima de 4.5:1).
- **SC-003**: 100% dos inputs do sistema mudam sua borda para o verde institucional (`#008744`) quando recebem foco do usuário.

## Assumptions

- O design institucional é baseado estritamente na especificação fornecida em `specs/ui-theme-spec.md`.
- Não há necessidade de suportar temas dinâmicos configuráveis pelo usuário (Dark Mode/Light Mode dinâmico), sendo o tema institucional claro o padrão obrigatório e único.
- Os logotipos oficiais do LAMPEX e do IFES Serra estão disponíveis na pasta 'assets' sob os caminhos `assets/ifes_icon.png` e `assets/lampex_icon.jpg` e não sofrerão alterações estruturais, apenas de posicionamento e contexto cromático de fundo.
