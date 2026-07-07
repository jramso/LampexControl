# Design Tokens & Styling Model: UI Theme Redesign

This document describes the structure of styling tokens (CSS Custom Properties) and visual rules implemented for the IFES & LAMPEX institutional theme.

## Design Tokens (CSS Variables)

The following properties are defined globally in `:root` inside [style.css](../../src/style.css):

| CSS Variable | Hex Color | Description | Application |
|---|---|---|---|
| `--color-primary` | `#008744` | Verde Institucional | Botões primários, headers, abas ativas, bordas de foco. |
| `--color-primary-dark` | `#005c2e` | Verde Escuro | Estados `:hover` e botões pressionados. |
| `--color-accent` | `#d62d20` | Vermelho Destaque | Badges de `gestor`, mensagens de erro, alertas. |
| `--color-bg-main` | `#ffffff` | Branco Puro | Fundo principal da página, cards e contêineres. |
| `--color-bg-subtle` | `#f4f6f4` | Cinza Claro Sutil | Cabeçalhos de tabelas, inputs desabilitados. |
| `--color-text-dark` | `#1a1a1a` | Texto Escuro | Títulos, parágrafos, labels de formulários. |
| `--color-text-light` | `#ffffff` | Texto Claro | Texto interno de botões e badges coloridos. |
| `--color-border` | `#d1d7d1` | Cinza Borda | Linhas divisórias, bordas de inputs normais. |

## Mappings to Legacy CSS Variables

To avoid modifying all existing components, the legacy variables in `style.css` will be mapped to the new design tokens:

- `--bg-primary` -> `var(--color-bg-main)`
- `--bg-secondary` -> `var(--color-bg-main)`
- `--bg-tertiary` -> `var(--color-bg-subtle)`
- `--text-primary` -> `var(--color-text-dark)`
- `--text-secondary` -> `#4b5563` (Cinza escuro para contraste no fundo claro)
- `--text-muted` -> `#6b7280`
- `--accent-cyan` -> `var(--color-primary)`
- `--accent-cyan-glow` -> `rgba(0, 135, 68, 0.15)`
- `--accent-purple` -> `var(--color-primary-dark)`
- `--accent-red` -> `var(--color-accent)`
- `--border-color` -> `var(--color-border)`
- `--border-focus` -> `var(--color-primary)`
