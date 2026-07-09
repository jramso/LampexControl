# Research Log: Plataforma de Governança de Ações de Extensão

## Decision 1: Modelagem do Vínculo de Voluntários com Ações de Extensão

- **Decision**: Adicionar a coluna `acao_id` (UUID, chave estrangeira para `acao_extensao(id)`) diretamente na tabela `usuario`.
- **Rationale**: Cada voluntário e professor está atrelado a uma Ação de Extensão específica por semestre/sprint. Isso simplifica o modelo relacional sem a necessidade de uma tabela de junção muitos-para-muitos, permitindo carregar e filtrar voluntários facilmente pela chave estrangeira `acao_id`.
- **Alternatives considered**:
  - *Tabela associativa de junção (muitos-para-muitos)*: Rejeitada para evitar complexidade desnecessária nas consultas SQL e no frontend, dado que o escopo de atuação do voluntário é direcionado a um único projeto por vez.

## Decision 2: Migração e Integridade Histórica de `registro_atendimento`

- **Decision**: Adicionar `acao_id` como coluna obrigatória (`NOT NULL`) na tabela `registro_atendimento`. Para dados legados, criar uma Ação de Extensão Padrão (`codigo_src = 'PADRAO'`) e atualizar todos os atendimentos existentes para referenciá-la antes de ativar a restrição `NOT NULL`.
- **Rationale**: Atende à especificação de chave estrangeira obrigatória mantendo a compatibilidade e prevenindo falhas de integridade referencial com dados existentes no banco de dados da Aiven.
- **Alternatives considered**:
  - *Manter a coluna nullable*: Rejeitada porque a governança exige que todo atendimento seja categorizado em uma Ação de Extensão válida para fins de contabilidade de horas institucionais.

## Decision 3: Agrupamento das Métricas de Relatórios

- **Decision**: Atualizar as consultas SQL dos endpoints `/api/relatorios/monitores` e `/api/relatorios/alunos` para agrupar as horas por Ação de Extensão (`acao_id` e `nome_acao`) antes de retornar ao cliente, e adaptar o `ReportsPanel.vue` para exibir esses blocos agrupados.
- **Rationale**: Realizar o agrupamento e ordenação diretamente no banco de dados PostgreSQL é muito mais eficiente em termos de performance e reduz o processamento necessário no frontend.
- **Alternatives considered**:
  - *Agrupamento no lado do cliente (Vue)*: Rejeitado porque exige trafegar metadados brutos adicionais da API e recriar a lógica de agregação em JavaScript, o que prejudica a performance e a consistência dos dados.
