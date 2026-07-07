# 📋 Especificação de Engenharia: Fluxo de Triagem de Potenciais Voluntários

## 1. Visão Geral do Fluxo de Inscrição e Aprovação

Para manter a integridade do corpo de monitores do LAMPEX, o processo de entrada de novos membros funcionará em duas etapas isoladas:

1. **Etapa Pública (Inscrição):** O aluno acessa uma tela aberta, preenche seus dados acadêmicos e responde como conheceu o projeto. Essas informações são salvas em um estado de triagem.
2. **Etapa Administrativa (Aprovação):** O gestor (como o perfil do usuário `josue.rsou2@gmail.com`) visualiza a lista de candidatos pendentes em seu painel privado e decide quem será promovido a monitor oficial do sistema.

---

## 2. Contratos Técnicos por Subprojeto

### 📂 Subprojeto API Backend (`/lampex-control-api`)

O Worker atuará como a camada de persistência e validação (Controller), operando sobre uma nova estrutura relacional no banco da Aiven.

#### A. Estrutura da Tabela de Triagem (PostgreSQL)

O agente deve garantir a existência da tabela `potencial_voluntario` via comandos SQL assíncronos:

```sql
CREATE TABLE IF NOT EXISTS potencial_voluntario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    telefone TEXT NOT NULL,
    curso TEXT NOT NULL,
    matricula TEXT UNIQUE NOT NULL,
    origem_cadastro TEXT CHECK (origem_cadastro IN (
        'Instagram', 
        'Youtube', 
        'Professores ou colegas de turma', 
        'Membros da Equipe Executora do Projeto Lampex', 
        'Avisos do Ifes'
    )),
    status_aprovacao TEXT NOT NULL DEFAULT 'Pendente' CHECK (status_aprovacao IN ('Pendente', 'Aprovado', 'Rejeitado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

```

#### B. Endpoints a serem Desenvolvidos

1. **`POST /api/voluntarios/cadastro` (Rota Pública):** Recebe o payload do formulário e realiza o `INSERT` na tabela `potencial_voluntario` com o status padrão `'Pendente'`. Retorna status `201 Created`.
2. **`GET /api/voluntarios/pendentes` (Rota Protegida - Requer JWT de Gestor):** Retorna todas as linhas onde `status_aprovacao = 'Pendente'`.
3. **`POST /api/voluntarios/:id/aprovar` (Rota Protegida - Requer JWT de Gestor):** * Altera o `status_aprovacao` do voluntário para `'Aprovado'`.
* Realiza um `INSERT` automático na tabela `monitor`, copiando os campos compatíveis, definindo a `role = 'monitor'`, `permite_exibir_contato = FALSE` e gerando uma senha hash inicial segura baseada em criptografia `pgcrypto`.



---

### 📂 Subprojeto Frontend (`/lampex-control`)

A interface Vue 3 deve consumir as novas rotas injetando a paleta de cores oficial (Verde Institucional `#008744` e Vermelho Accent `#d62d20`).

#### A. Componente `CadastroMonitor.vue` (Rota Pública)

* **Formulário Estruturado:** Inputs higienizados com TypeScript para coletar: *Nome*, *Email*, *CPF*, *Telefone*, *Curso* e *Matrícula*.
* **Campo do Tipo Select:** Pergunta obrigatória: `"Como ficou sabendo do Projeto Lampex?"` listando rigorosamente as 5 opções descritas no CHECK da tabela do banco.
* **Estilo:** Botão de submissão estilizado em Verde Institucional com transição suave no `:hover`. Dispara o evento para o endpoint público.

#### B. Atualização do `ManagerDashboard.vue` (Aba de Triagem)

* Exibir uma nova seção/aba visível apenas se o usuário autenticado contiver a role `'gestor'`.
* A aba renderizará uma tabela listando os potenciais voluntários pendentes obtidos da API.
* **Ações Rápidas:** Cada linha da tabela conterá dois botões:
* **Botão Aprovar:** Ícone ou texto em Verde (`#008744`) que aciona a rota de aprovação por ID.
* **Botão Rejeitar:** Ícone ou texto em Vermelho (`#d62d20`) que altera o status do candidato para rejeitado, removendo-o da listagem visual.



