# Implementation Plan: Responsividade e Adequação Mobile (Mobile-First)

**Branch**: `006-responsive-mobile-ui` | **Date**: 2026-07-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-responsive-mobile-ui/spec.md`

**Note**: This plan is generated to implement mobile responsiveness across all core components of the LampexControl system.

## Summary

O objetivo principal desta funcionalidade é refatorar a interface do LampexControl para garantir que ela se adapte de forma ergonômica, fluida e totalmente funcional em dispositivos móveis (smartphones e tablets), com foco no design Mobile-First. Isso envolve a transformação da navbar em um menu hambúrguer, o empilhamento responsivo de formulários (Login e Cadastro), a conversão de tabelas em cards responsivos e a substituição da visualização de PDF inline por links externos em telas pequenas.

A abordagem técnica envolverá a edição de estilos globais em `src/style.css` (para definir tokens, variáveis CSS de tamanho, tratamento de inputs e botões globais) e ajustes específicos com Tailwind/CSS scoped e estados do Vue nos respectivos arquivos dos componentes.

## Technical Context

**Language/Version**: Vue 3 (v3.5.39), TypeScript (v6.0.2)

**Primary Dependencies**: `@supabase/postgrest-js`, `vue-router` (v4.4.0), `vite` (v8.1.1)

**Storage**: PostgREST client API integration (no backend database schema changes needed)

**Testing**: `vitest` (v4.1.10) for unit/component testing

**Target Platform**: Navegadores Web Móveis (Safari iOS, Chrome Android) e Desktop (breakpoints em 768px)

**Project Type**: Single Page Application (SPA) / Web Frontend

**Performance Goals**: Layout CLS (Cumulative Layout Shift) < 0.1; tempo de transição do menu hambúrguer < 200ms; carregamento de página e renderização responsiva instantâneos.

**Constraints**: Preservação das cores institucionais do IFES/LAMPEX (verde `#008744` e vermelho `#d62d20`); altura mínima de elementos tocáveis (`44px`); proibição absoluta de barras de rolagem horizontal globais no body do site.

**Scale/Scope**: Refatoração da Navbar global (`App.vue`), Login (`Login.vue`), Inscrição (`CadastroMonitor.vue`), Dashboard (`ManagerDashboard.vue`), painel de listagem (`TriagemPanel.vue`) e auditoria (`AuditPanel.vue`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

* **Princípio I: Arquitetura MVC Desacoplada**: Aprovado. A implementação altera unicamente a camada View (estilos, marcação HTML e comportamento local Vue dos componentes). Sem impactos na controller ou model.
* **Princípio II: Spec-Driven Development**: Aprovado. A especificação visual em `spec.md` foi concluída e validada antes de iniciar o planejamento técnico.
* **Princípio III: Tipagem Estática**: Aprovado. Nenhuma alteração de tipos ou objetos de banco de dados é necessária; tipos existentes do PostgREST gerados no schema.ts serão preservados.
* **Princípio IV: Código Limpo e Sem Comentários Redundantes**: Aprovado. As alterações CSS e HTML serão mantidas limpas e com documentação concisa e não óbvia.
* **Restrições Tecnológicas**: Aprovado. Toda regra de negócio é preservada, focando apenas no encapsulamento de estilos e reatividade local.

*Resultado do Gate:* **PASSED**. Nenhuma violação detectada.

## Project Structure

### Documentation (this feature)

```text
specs/006-responsive-mobile-ui/
├── plan.md              # Este arquivo (Plano de implementação)
├── research.md          # Pesquisa técnica e decisões de design
├── data-model.md        # Estado da UI e mapeamento de dados do cartão
├── quickstart.md        # Guia de validação end-to-end e cenários de testes
└── contracts/
    └── ui-design-contract.md # Breakpoints, tokens de cores e contrato ergonômico
```

### Source Code

```text
src/
├── style.css            # Folha de estilo CSS global (onde serão injetadas as variáveis e resets globais de 44px)
├── App.vue              # Componente raiz contendo a Navbar responsiva com menu hambúrguer
├── components/
│   ├── CadastroMonitor.vue # Formulário de cadastro adaptado para empilhar em mobile
│   ├── TriagemPanel.vue    # Painel de triagem que oculta tabela e exibe cards empilhados
│   └── AuditPanel.vue      # Painel de auditoria que oculta o iframe PDF no mobile
└── pages/
    ├── Login.vue           # Tela de login adaptada para cards fluidos
    └── ManagerDashboard.vue # Dashboard com controle responsivo de abas
```

**Structure Decision**: A estrutura segue o modelo padrão Single Project do LampexControl. O trabalho de refatoração será restrito às pastas de componentes (`src/components/`), páginas (`src/pages/`), layout principal (`src/App.vue`) e folha de estilo (`src/style.css`).

## Complexity Tracking

*Nenhuma violação às regras da constituição foi detectada, portanto esta tabela permanece vazia.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | N/A        | N/A                                 |
