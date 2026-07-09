# Architectural Decisions & Research: Replanejamento de Cargos e Monitoria com Professor

Este documento detalha as decisões técnicas, justificativas e alternativas consideradas para o replanejamento de cargos e a validação de monitoria com professor.

## Decisão 1: Modelagem e Transição de Roles no PostgreSQL

### Contexto
O banco de dados possui uma restrição `CHECK (role IN ('monitor', 'gestor'))` na tabela `monitor`. O novo escopo exige suporte a: `'voluntario'`, `'professor'`, `'gestor_fixo'`, `'gestor_temporario'`.

### Escolha
A restrição de `CHECK` existente será substituída por uma nova restrição que suporta apenas as novas roles. Além disso, criaremos um script de migração de dados (data migration) para atualizar os registros existentes de forma segura:
- `monitor` -> `voluntario`
- `gestor` -> `gestor_fixo` (Josué, Bruno, Emmanuel e demais gestores legados serão migrados inicialmente para `gestor_fixo`)

### Justificativa
Garante compatibilidade total e integridade referencial dos dados legados, evitando falhas de integridade ao aplicar a nova constraint de verificação no banco.

### Alternativas Consideradas
- **Adicionar as novas roles sem remover as antigas**: Rejeitada porque manteria roles obsoletas (`monitor` e `gestor`) ativas no banco, aumentando a complexidade da governança de dados.

---

## Decisão 2: Validação do Código do Monitor (Últimos 4 Dígitos da Matrícula)

### Contexto
Ao registrar um atendimento, o aluno precisa fornecer o "código do monitor".

### Escolha
O código enviado pelo aluno (`codigo_monitor`) será validado diretamente no backend na rota `POST /api/atendimentos/registrar`. O backend buscará a matrícula cadastrada do monitor e verificará se `typed_code === right(matricula, 4)`.

### Justificativa
Adiciona uma camada extra de segurança impedindo que requisições forjadas criem registros sem o consentimento ou presença do monitor. A validação no backend é obrigatória para segurança, e a validação no frontend provê feedback rápido ao usuário.

### Alternativas Consideradas
- **Validação apenas no Frontend**: Rejeitada porque um atacante ou aluno mal-intencionado poderia contornar o bloco simulando requisições HTTP diretamente para o endpoint `/api/atendimentos/registrar`.

---

## Decisão 3: Confirmação de Senha de Aula via Tabela de Aulas do Dia

### Contexto
A modalidade "Presencial com Professor" exige a inserção e verificação de uma "senha de aula" que não é a senha pessoal do professor, mas sim um código diário temporário criado pelo professor para aquela aula.

### Escolha
Criar uma nova tabela `monitoria_professor` que mapeia a `senha_aula` de cada dia, associada ao professor. Quando o aluno submete o formulário com a modalidade "Presencial com Professor", o backend valida se existe um registro correspondente na tabela para o dia de hoje (`data_aula = CURRENT_DATE`), com status `'Ativo'` e que corresponda à senha enviada pelo aluno.
O professor pode criar a senha no seu painel de perfil e também fechar o recebimento manualmente (alterando o status da aula para `'Fechado'`).

### Justificativa
Garante alto nível de segurança operacional, assegurando que apenas os alunos realmente presentes em sala no dia corrente consigam se registrar, sem comprometer a senha de login do professor e respeitando a governança do fuso horário diário.

### Alternativas Consideradas
- **Validar contra a senha de acesso pessoal do professor**: Rejeitada porque exigiria que o professor expusesse sua credencial de login aos alunos em sala de aula, apresentando grave risco de segurança.
- **Utilizar uma senha global estática**: Rejeitada porque permitiria que alunos registrassem presença indefinidamente em dias futuros sem participação real.

---

## Decisão 4: Ferramenta de Promoção de Gestor Temporário

### Contexto
O coordenador (`gestor_fixo`) precisa delegar a role de `gestor_temporario` para Bruno Gestor e Emmanuel Gestor de forma ágil no frontend.

### Escolha
No painel do administrador (`ManagerDashboard.vue`), sob a aba de gestão, adicionaremos uma ferramenta dedicada que lista Bruno Gestor (`bruno@ifes.edu.br`) e Emmanuel Gestor (`emmanuel@ifes.edu.br`) obtidos da base de dados, permitindo alternar a role deles entre seu estado base e `gestor_temporario`. O backend atualizará a role no banco através de uma chamada segura e protegida a `PATCH /api/monitor?id=eq.ID`, exigindo autenticação do usuário logado com a role `gestor_fixo`.

### Justificativa
Mantém o controle do cargo restrito à coordenação oficial (`gestor_fixo`) e provê uma interface limpa e intuitiva sem expor comandos SQL diretos.
As roles de Bruno Gestor, Emmanuel Gestor e Josué são configuradas como `gestor_fixo` inicialmente para preservar o acesso administrativo original.

### Alternativas Consideradas
- **Permitir que gestores temporários promovam outros**: Rejeitado para manter o princípio da autoridade centralizada na coordenação (gestor_fixo).
