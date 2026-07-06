<!--
Sync Impact Report:
- Version change: [ALL_CAPS_IDENTIFIER] -> 1.0.0
- List of modified principles:
  - [PRINCIPLE_1_NAME] -> I. Arquitetura MVC Desacoplada com PostgREST e Vue 3
  - [PRINCIPLE_2_NAME] -> II. Spec-Driven Development e OpenAPI como Fonte da Verdade
  - [PRINCIPLE_3_NAME] -> III. Tipagem Estática End-to-End no schema.ts
  - [PRINCIPLE_4_NAME] -> IV. Código Limpo e Livre de Comentários Redundantes
  - [PRINCIPLE_5_NAME] -> V. Cálculo Automatizado de Horas do LAMPEX
- Added principles:
  - VI. Privacidade Parametrizável de Contato do Monitor
  - VII. Trava de Segurança contra Computação Indevida de Horas
  - VIII. Fluxo Unificado de Registro Semanal
- Added sections:
  - Restrições Tecnológicas e Arquiteturais
  - Fluxo de Desenvolvimento e Rastreabilidade
- Removed sections: None
- Templates requiring updates:
  - .specify/templates/plan-template.md (✅ updated/aligned)
  - .specify/templates/spec-template.md (✅ updated/aligned)
  - .specify/templates/tasks-template.md (✅ updated/aligned)
- Follow-up TODOs: None
-->

# LampexControl Constitution

## Core Principles

### I. Arquitetura MVC Desacoplada com PostgREST e Vue 3
O LampexControl deve obrigatoriamente seguir uma arquitetura desacoplada. O banco de dados PostgreSQL na Aiven atua como Model; o PostgREST atua como Controller de forma transparente exposta via OpenAPI; e o frontend em Vue 3 + TS + Vite atua como View, consumindo a API por meio do cliente `@supabase/postgrest-js`.

### II. Spec-Driven Development e OpenAPI como Fonte da Verdade
O contrato OpenAPI é a única fonte da verdade para o comportamento do sistema. Qualquer mudança de rotas, esquemas ou lógica de interface dependente da API deve ser definida no contrato antes da implementação no frontend ou banco de dados.

### III. Tipagem Estática End-to-End no schema.ts
Toda tipagem do frontend que represente a API do PostgREST deve ser gerada automaticamente via CLI a partir do contrato OpenAPI no arquivo `schema.ts`. É proibido criar ou alterar tipagens manuais para os objetos do banco de dados.

### IV. Código Limpo e Livre de Comentários Redundantes
O código deve ser limpo, legível, expressivo e livre de comentários redundantes, obsoletos ou citações desnecessárias. Comentários devem justificar decisões de design complexas, nunca descrever o funcionamento óbvio do código.

### V. Cálculo Automatizado de Horas do LAMPEX
A conversão de horas brutas em horas líquidas deve ser calculada de forma automatizada no banco de dados com base na tabela de pesos oficial do laboratório (Monitorias: x2; Minicurso com material: x3; Minicurso sem material: x2.5; Marketing Digital: 2h por post e 4h por perfil; Desenvolvimento de Software/Outros: parametrizável pela gestão).

### VI. Privacidade Parametrizável de Contato do Monitor
O sistema deve exibir os dados de contato do monitor para o aluno com base estrita no status do agendamento (somente visível para agendamentos confirmados) e conforme a opção de privacidade configurada pelo próprio monitor.

### VII. Trava de Segurança contra Computação Indevida de Horas
Reuniões de planejamento comuns não devem ter suas horas líquidas computadas automaticamente para certificação, exceto quando explicitamente marcadas e justificadas de forma manual pela gestão.

### VIII. Fluxo Unificado de Registro Semanal
O fluxo de registro semanal de atividades do monitor deve ser unificado, permitindo e aceitando múltiplos itens de atividade por semana de referência em uma única submissão.

## Restrições Tecnológicas e Arquiteturais

1. **PostgreSQL como Cérebro**: Regras de negócio críticas, validações de integridade e cálculos de pesos de horas devem residir obrigatoriamente no PostgreSQL através de views, restrições (constraints) e triggers.
2. **Consumo de API**: O frontend em Vue 3 deve obrigatoriamente consumir os endpoints gerados pelo PostgREST utilizando as tipagens do `schema.ts`.

## Fluxo de Desenvolvimento e Rastreabilidade

1. **Desenvolvimento Dirigido por Especificação**: Cada nova funcionalidade deve passar pelas etapas de especificação (`spec.md`), planejamento (`plan.md`) e definição de tarefas (`tasks.md`) antes de qualquer alteração de código.
2. **Sem Comentários Redundantes**: Commits e PRs que adicionem comentários óbvios que apenas replicam o comportamento de funções limpas serão rejeitados na etapa de code review.
3. **Testabilidade**: Os fluxos críticos de cálculo de horas e privacidade parametrizável devem ser cobertos por testes de integração e validações estruturadas no banco de dados.

## Governance

1. **Soberania da Constituição**: Esta constituição é soberana e rege todas as práticas de engenharia do projeto LampexControl.
2. **Gestão de Desvios**: Qualquer desvio ou exceção a estas diretrizes deve ser documentado e explicitamente justificado na seção "Complexity Tracking" do respectivo arquivo `plan.md`.
3. **Processo de Emenda**: Emendas a esta constituição requerem incremento na versão e aprovação formal pela coordenação do projeto.

**Version**: 1.0.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-06
