# Research & Design Decisions: Responsividade e Adequação Mobile

## 1. Estratégia de Tabelas Responsivas no Painel de Triagem

* **Decision**: Usar a abordagem de duplicação visual controlada via CSS (`display: none` / `display: block`) no componente `TriagemPanel.vue`. Sob viewports menores que 768px, a tag `<table>` é ocultada e uma lista de cartões empilháveis (`<div class="candidate-card">`) é exibida.
* **Rationale**: Tabelas nativas HTML são notoriamente difíceis de estilizar para adequação móvel vertical sem quebrar a semântica. Ao usar classes utilitárias no CSS que alteram o `display` baseado em media queries, garantimos excelente legibilidade e semântica no desktop, e um fluxo limpo e ergonômico no mobile, sem o custo de renderização de ouvintes de redimensionamento JS complexos.
* **Alternatives considered**:
  * *Rolagem Horizontal Controlada (`overflow-x: auto`)*: Rejeitada para a lista de candidatos da triagem porque rolar lateralmente tabelas com muitas colunas em telas de smartphones resulta em uma experiência de usuário pobre e dificulta a visualização e clique dos botões de ação (Aprovar/Rejeitar).
  * *Transformar as linhas da tabela em blocos (`display: block` nas tags `tr` e `td`)*: Considerada, mas gera regras CSS redundantes e difíceis de manter em comparação com uma estrutura de cartões Vue dedicada e limpa.

---

## 2. Menu de Navegação Superior (Hamburger Menu) em App.vue

* **Decision**: Implementar um estado reativo local `isMenuOpen = ref(false)` em `App.vue` e controlar a exibição da lista vertical de links sob telas menores que 768px.
* **Rationale**: Uma solução puramente baseada em estado reativo do Vue 3 é extremamente leve (sem dependências externas), fácil de manter e permite adicionar transições fluidas no CSS nativo (ex: alterando a opacidade e transformações).
* **Alternatives considered**:
  * *Navegação baseada puramente em CSS (checkbox hack)*: Rejeitada porque a manipulação por meio de estado reativo Vue é o padrão do projeto e facilita fechar o menu automaticamente ao clicar em um link de rota ou ao realizar logout.

---

## 3. Visualização de PDFs na Auditoria (AuditPanel.vue)

* **Decision**: Ocultar o contêiner `iframe` que carrega o PDF em telas com menos de 768px de largura, substituindo-o por um botão ou link de ação primária "Abrir Relatório em Nova Aba" (`target="_blank"`).
* **Rationale**: Iframe em telas de celulares costuma ser difícil de interagir (problemas de rolagem interna, zoom espremido e escala). Exibir um PDF de 600px de altura consome toda a viewport do smartphone de forma ineficiente. Abrir o PDF em uma nova aba delega ao visualizador de PDF nativo do dispositivo móvel (iOS/Android), garantindo a melhor experiência.
* **Alternatives considered**:
  * *Redimensionar o Iframe*: Rejeitada porque, mesmo que diminuamos a altura, ler um documento PDF Proex completo em uma largura de 320px-375px dentro de um iframe é praticamente impossível sem zoom manual constante.

---

## 4. Altura Mínima e Áreas de Toque (Touch Targets)

* **Decision**: Ajustar a classe global `.btn-primary`, `.btn-secondary`, `.form-input`, `.form-select` e `.form-textarea` no arquivo `style.css` para assegurar altura mínima de `44px`. Onde houver botões inline ou estilizados com paddings específicos, garantir que o padding vertical produza uma altura calculada igual ou superior a `44px`.
* **Rationale**: O valor de 44x44 CSS pixels é a recomendação oficial do W3C (WCAG 2.1 - Target Size) e diretrizes da Apple/Google para evitar cliques acidentais e melhorar a acessibilidade física de navegação por toque em dispositivos móveis.
* **Alternatives considered**:
  * *Modificar cada botão individualmente*: Rejeitado por violar o princípio de consistência e aumentar o esforço de manutenção. A centralização no arquivo global `style.css` resolve para todos os formulários e botões legados.
