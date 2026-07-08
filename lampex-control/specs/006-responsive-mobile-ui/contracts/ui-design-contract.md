# UI & CSS Layout Contracts

Este documento define as especificações e contratos visuais que regem a adequação responsiva do LampexControl. Qualquer componente ou folha de estilo adicionada ou modificada deve seguir estritamente estas diretrizes de design.

## 1. Breakpoints e Adaptabilidade de Layout

O sistema adota uma abordagem de corte simplificada para garantir compatibilidade e carregamento rápido, usando o seguinte contrato de Viewports:

| Viewport Category | Largura de Tela (Breakpoints) | Comportamento do Componente |
|-------------------|-------------------------------|-----------------------------|
| **Mobile**        | `< 768px`                     | Navegação oculta sob menu hambúrguer; colunas de grid empilhadas verticalmente (1 coluna); tabelas largas ocultas e exibidas como cartões (cards); iframes de PDF ocultados com opção de botão para nova aba. |
| **Desktop/Tablet**| `>= 768px`                    | Barra de navegação expandida horizontalmente; grids com múltiplas colunas paralelas; tabelas tabulares nativas; visualização integrada de PDFs inline (iframes de 600px). |

---

## 2. Cores Institucionais e Contraste

Para preservar a identidade visual do IFES e do LAMPEX, o contraste deve obedecer aos seguintes tokens CSS:

* **Verde Institucional (Principal)**: `#008744` (utilizado em tokens como `--color-primary`, botões primários, badges de aprovação/monitor, links ativos).
* **Vermelho Institucional (Destaque)**: `#d62d20` (utilizado em tokens como `--color-accent`, botões de exclusão, recusa e badges de gestor/cancelamento).
* **Fundo de Cartão (Glassmorphism)**: Usar as variáveis `--bg-primary` e border `--border-color` para garantir legibilidade tanto no tema claro quanto em futuros ajustes escuros.

---

## 3. Ergonomia e Acessibilidade de Toque (Touch Targets)

Todos os elementos interativos em dispositivos móveis devem possuir uma área de clique/toque ergonômica mínima:

* **Tamanho Mínimo**: `44px` de altura e `44px` de largura (ou padding equivalente).
* **Elementos afetados**:
  * Inputs de formulário (`.form-input`, `.form-select`, `.form-textarea`)
  * Botões de envio (`.btn-primary`, `.btn-secondary`)
  * Botões de ação rápida (como "Aprovar" e "Rejeitar" na triagem de voluntários)
  * Links do menu móvel vertical
