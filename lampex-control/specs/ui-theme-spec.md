# 🎨 Especificação de Design de Interface: Sistema de Cores LAMPEX/IFES

## 1. Identidade Visual e Conceito

A interface do `lampex-control` deve refletir de forma profissional a identidade institucional do IFES e o propósito tecnológico do laboratório. O layout utilizará um fundo predominantemente claro e limpo (Branco/Cinza muito claro), o **Verde Institucional** como cor de base e estrutura primária, e o **Vermelho** cirurgicamente aplicado como elemento de destaque (*Accent*) para alertas, estados ativos importantes e pontos de foco críticos.

## 2. Design Tokens (Paleta de Cores)

Para implementação técnica (CSS Variables ou configuração do `tailwind.config.js`), os valores hexadecimais extraídos e ajustados para acessibilidade são:

| Elemento | Nome do Token | Cor Hexadecimal | Aplicação em Interface |
| --- | --- | --- | --- |
| **Primária** | `--color-primary` | `#008744` | Headers, bordas ativas, botões principais, títulos de seções. |
| **Primária Dark** | `--color-primary-dark` | `#005c2e` | Estados `:hover` e botões pressionados. |
| **Destaque** | `--color-accent` | `#d62d20` | Notificações, ponto de lâmpada ativa, erros, tags críticas. |
| **Fundo Principal** | `--color-bg-main` | `#ffffff` | Fundo geral da página e dos cartões (Cards). |
| **Fundo Secundário** | `--color-bg-subtle` | `#f4f6f4` | Fundos de tabelas, áreas de código ou inputs desabilitados. |
| **Texto Escuro** | `--color-text-dark` | `#1a1a1a` | Textos principais, parágrafos e legendas de formulários. |
| **Texto Claro** | `--color-text-light` | `#ffffff` | Texto interno de botões e badges coloridos. |
| **Bordas** | `--color-border` | `#d1d7d1` | Divisores de tabelas e contorno de caixas de texto. |

---

## 3. Aplicação nos Componentes do Sistema (`lampex-control`)

### A. Tela de Autenticação (`Login.vue`)

* **Fundo da Tela:** Branco absoluto (`#ffffff`), mantendo o foco total nos elementos centrais.
* **Logotipo:** Centralizado no topo, exibindo as imagens oficiais integradas (LAMPEX e IFES Serra).
* **Botão de Ação (Entrar):** Fundo preenchido com o Verde Primário (`#008744`), texto em Branco (`#ffffff`). Ao passar o mouse (`:hover`), transiciona suavemente para `#005c2e`.
* **Mensagens de Erro/Validação:** Texto em Vermelho Destaque (`#d62d20`) posicionado logo abaixo do input correspondente.

### B. Painel do Gestor (`ManagerDashboard.vue`) e Grade Geral

* **Barra Superior (Navbar):** Fundo Verde Primário (`#008744`) com o título "Lampex Control" e links de navegação em texto Branco (`#ffffff`).
* **Indicadores de Status (Widgets/Cards):**
* *Módulo Ativo/Funcional:* Borda sutil em verde com um ponto indicador verde piscante.
* *Módulo com Alerta/Ação Necessária:* Borda ou indicador com a cor Vermelho (`#d62d20`), simulando o detalhe do nó vermelho do ícone do LAMPEX.


* **Tabelas de Monitores e Horas:**
* Cabeçalho da tabela com fundo Cinza Claro Institucional (`#f4f6f4`) e texto escuro (`#1a1a1a`).
* Linhas alternadas (*Zebra striping*) utilizando opacidade reduzida do verde secundário para não poluir a leitura visual.



### C. Estados de Componentes Comuns

* **Inputs (Campos de Texto):** Borda padrão cinza (`#d1d7d1`). Ao ganhar foco (`:focus`), a borda muda para o Verde Primário (`#008744`) acompanhado de um *outline* suave.
* **Badges de Permissão/Roles:**
* Papel `gestor`: Fundo Vermelho (`#d62d20`) com texto branco (destaque máximo na administração).
* Papel `monitor`: Fundo Verde (`#008744`) com texto branco.



