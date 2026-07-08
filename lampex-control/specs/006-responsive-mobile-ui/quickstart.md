# Quickstart & Validation Guide: Responsividade e Adequação Mobile

Este guia descreve os cenários de teste manuais e automatizados para validar que as alterações de responsividade e adequação móvel (Mobile-First) atendem a todos os critérios de aceitação definidos na especificação.

## Pré-requisitos e Inicialização

1. **Instalação das dependências**:
   ```bash
   npm install
   ```
2. **Executar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   *Nota: O servidor iniciará por padrão em `http://localhost:5173`.*

---

## Cenários de Validação (Mobile Emulation)

Utilize as ferramentas de desenvolvedor do navegador (F12) e ative a emulação de dispositivos móveis (Device Mode) para testar os viewports de **320px** (iPhone SE), **375px/390px** (smartphones comuns) e **768px** (iPads/tablets).

### Cenário 1: Barra de Navegação Responsiva (Navbar)

1. **Redimensionar** o viewport do navegador para **360px** de largura.
2. **Verificar** se os links de navegação horizontal usuais sumiram.
3. **Confirmar** a presença do ícone de menu hambúrguer no topo direito da barra verde.
4. **Tocar/Clicar** no botão hambúrguer:
   * A lista vertical de links deve surgir sob a barra principal.
   * Todos os botões/links devem ser facilmente clicáveis (altura mínima de 44px).
5. **Tocar/Clicar** novamente no botão hambúrguer:
   * A lista vertical deve desaparecer suavemente.
6. **Redimensionar** de volta para **1024px** de largura:
   * O menu hambúrguer deve sumir e a barra de links horizontal original deve reaparecer.

### Cenário 2: Formulários Fluidos (Login e Cadastro)

1. Abrir a rota de login (`/login`) em um viewport móvel de **360px**:
   * O card branco deve se esticar horizontalmente ocupando quase toda a tela, mantendo uma margem lateral confortável (ex: 16px).
   * Os campos de e-mail e senha devem possuir altura física confortável (>= 44px).
   * O botão "Entrar no Sistema" deve ocupar 100% da largura do card com altura confortável de toque.
2. Abrir a rota ou exibir o componente de Cadastro do Monitor (`CadastroMonitor.vue`):
   * Confirmar que os campos "CPF" e "Matrícula Ifes" (antes lado a lado) estão agora empilhados um sobre o outro verticalmente.
   * Confirmar que o mesmo ocorre com "E-mail" e "Telefone/WhatsApp".
   * Testar a submissão para garantir que a validação de CPF e fluxo de dados funcionam normalmente.

### Cenário 3: Painel de Gestão e Dashboard (Aba Triagem)

1. Logar no sistema como gestor e abrir a rota do painel (`ManagerDashboard.vue`).
2. Mudar a aba ativa para "Triagem de Voluntários" e emular tamanho de tela de **375px**:
   * A tabela HTML tradicional deve sumir.
   * Em seu lugar, os voluntários pendentes devem ser exibidos como cartões individuais organizados de forma vertical.
   * Os botões "Aprovar" (verde) e "Rejeitar" (vermelho) devem se esticar com largura cheia ou dispostos de forma que a área de toque individual seja de no mínimo 44px de altura.

### Cenário 4: Painel de Gestão e Dashboard (Aba Auditoria)

1. No dashboard de gestor sob viewport móvel, abrir a aba "Fila de Auditoria de Horas".
2. Selecionar um relatório na lista rápida.
3. **Verificar**:
   * O painel lateral direito de visualização de PDF (`iframe`) deve estar totalmente ocultado na tela móvel.
   * Um botão primário "Abrir Relatório em Nova Aba" ou "Visualizar PDF" deve aparecer em destaque no card de detalhes.
   * Tocar no botão e certificar-se de que o PDF é aberto corretamente em uma nova aba do navegador (`target="_blank"`).

---

## Verificação de Não-Regressão e Critérios Técnicos

* **Sem Overflow Horizontal**: Rolar a página verticalmente de cima a baixo em qualquer tamanho de tela mobile e verificar se a página "dança" ou desliza lateralmente. A rolagem horizontal global no body deve estar desativada (`overflow-x: hidden`).
* **Validação de Toques com DevTools**:
  * É possível inspecionar os elementos de botão e inputs e verificar na aba *Computed* do DevTools se a propriedade `height` resolvida possui o valor mínimo de `44px`.
