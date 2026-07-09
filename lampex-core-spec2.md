# 📋 Especificação de Engenharia: Replanejamento de Cargos, Código de Validação e Monitoria Presencial com Professor

## 1. Escopo de Regras de Negócio (O Que o Sistema Faz)

### A. Validação por Código do Monitor (Últimos 4 Dígitos)

* **Objetivo:** Prevenir colisão de nomes idênticos no banco de dados durante o preenchimento da **Monitoria Rápida**.
* **Funcionamento:** No formulário de atendimento, o aluno atendido deve obrigatoriamente digitar os **últimos 4 dígitos da matrícula** do monitor que o atendeu. A API cruzará o nome selecionado com o código digitado para computar as horas corretamente.

### B. Nova Matriz de Cargos e Usuários

O sistema deixa de ter o papel genérico de `monitor` e passa a operar com a seguinte estrutura:

1. **Voluntários (Antigos monitores):** Alunos que prestam atendimento.
2. **Professores:** Servidores do IFES com a atribuição única de validar atividades de monitorias ocorridas dentro de suas salas de aula.
3. **Gestores Fixos:** Contas permanentes de administração do laboratório: `Bruno`, `Emanuel` e `Gestor` (conta root de testes).
4. **Gestores Temporários:** Bolsistas do LAMPEX selecionados entre os *Voluntários*. Os gestores fixos (Bruno/Emanuel) possuem um botão no painel para promover ou rebaixar um Voluntário para o cargo de gestor temporário.

### C. Novas Modalidades de Monitoria

* **Monitoria Online:** Registro regular via formulário.
* **Monitoria Presencial:** Registro regular via formulário.
* **Monitoria Presencial com Professor:** * Ocorre em sala de aula ou laboratório integrado. O monitor ou professor inicia a sessão no sistema e define uma **senha de acesso diária**.
* A sessão fica visível na tela de **Monitoria Rápida** dos alunos durante aquele dia. O aluno deve digitar a senha fornecida pelo professor para computar sua presença.
* **Inclusão Retroativa:** Caso o aluno esqueça de marcar no dia, o monitor ou o professor podem inseri-lo manualmente a qualquer momento através do painel.



---

## 2. Contratos Técnicos por Subprojeto

### 📂 Subprojeto API Backend (`/lampex-control-api`)

#### A. Ajuste na Camada de Dados (PostgreSQL na Aiven)

O agente deve aplicar uma migração alterando a restrição de check de papéis e adicionando as colunas de senha de sessão:

```sql
-- 1. Atualizar a restrição de roles da tabela monitor
ALTER TABLE monitor DROP CONSTRAINT IF EXISTS monitor_role_check;
ALTER TABLE monitor ADD CONSTRAINT monitor_role_check 
CHECK (role IN ('voluntario', 'professor', 'gestor_fixo', 'gestor_temporario'));

-- 2. Adicionar campos de sessão para monitoria com professor em registro_atendimento
ALTER TABLE registro_atendimento DROP CONSTRAINT IF EXISTS registro_atendimento_modalidade_check;
ALTER TABLE registro_atendimento ADD CONSTRAINT registro_atendimento_modalidade_check 
CHECK (modalidade IN ('Online', 'Presencial', 'Presencial com Professor'));

ALTER TABLE registro_atendimento ADD COLUMN IF NOT EXISTS senha_sessao TEXT;
ALTER TABLE registro_atendimento ADD COLUMN IF NOT EXISTS professor_id UUID REFERENCES monitor(id);

```

#### B. Endpoints a serem Desenvolvidos/Modificados

1. **`POST /api/atendimentos/registrar` (Público):** Deve validar se o `codigo_monitor` enviado equivale aos últimos 4 caracteres da matrícula do monitor no banco. Se a modalidade for `Presencial com Professor`, deve comparar o campo `senha` enviado pelo aluno com a senha ativa da sessão do dia.
2. **`PUT /api/gestao/cargo` (Protegido - Requer privilégio de `gestor_fixo`):** Permite que Bruno ou Emanuel atualizem a `role` de um usuário de `voluntario` para `gestor_temporario` ou vice-versa.

---

### 📂 Subprojeto Frontend (`/lampex-control`)

#### A. Componente `MonitoriaRapida.vue`

* **Campo Adicional:** Adicionar um input obrigatório: `Código do Monitor (4 últimos dígitos da matrícula)`.
* **Comportamento Dinâmico:** Caso a modalidade selecionada seja `Presencial com Professor`, um campo extra chamado `Senha da Aula` deve aparecer via `v-if`.

#### B. Painel Administrativo (`ManagerDashboard.vue`)

* **Aba Professores/Aulas:** Espaço para o professor abrir a sessão do dia definindo a senha.
* **Aba Equipe (Para Bruno e Emanuel):** Listagem de voluntários contendo um botão de alternância (*Toggle*) para promover o estudante a bolsista/gestor temporário.
