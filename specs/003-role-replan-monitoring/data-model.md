# Database Model Updates: Replanejamento de Cargos e Monitoria com Professor

Este documento descreve as modificações no banco de dados PostgreSQL para suportar o replanejamento de cargos e a monitoria com professor.

```mermaid
erDiagram
    MONITOR {
        uuid id PK
        text nome
        text email UNIQUE
        text senha_hash
        text telefone
        boolean permite_exibir_contato
        text plataforma_contato
        jsonb matriz_disponibilidade
        text role "CHECK ('voluntario', 'professor', 'gestor_fixo', 'gestor_temporario')"
        text matricula
        timestamp created_at
    }

    REGISTRO_ATENDIMENTO {
        uuid id PK
        uuid monitor_id FK
        text matricula
        text nome
        text modalidade "CHECK ('Presencial', 'Online', 'Presencial com Professor')"
        text local_ou_link
        numeric horas_duracao
        timestamp created_at
    }

    MONITORIA_PROFESSOR {
        uuid id PK
        uuid professor_id FK
        text senha_aula
        date data_aula
        text status "CHECK ('Ativo', 'Fechado')"
        timestamp created_at
    }

    MONITOR ||--o{ REGISTRO_ATENDIMENTO : "realiza"
    MONITOR ||--o{ MONITORIA_PROFESSOR : "gerencia"
```

## 1. Alterações nas Tabelas Existentes

### Tabela `monitor`

A coluna `role` terá sua restrição `CHECK` atualizada.

```sql
-- 1. Remover a restrição check antiga
ALTER TABLE monitor DROP CONSTRAINT IF EXISTS monitor_role_check;

-- 2. Migrar dados existentes para a nova nomenclatura de roles
UPDATE monitor SET role = 'voluntario' WHERE role = 'monitor';
UPDATE monitor SET role = 'gestor_fixo' WHERE role = 'gestor';

-- 3. Aplicar a nova restrição CHECK
ALTER TABLE monitor ADD CONSTRAINT monitor_role_check 
    CHECK (role IN ('voluntario', 'professor', 'gestor_fixo', 'gestor_temporario'));
```

### Tabela `registro_atendimento`

A coluna `modalidade` terá sua restrição `CHECK` atualizada para permitir a nova modalidade "Presencial com Professor".

```sql
-- 1. Remover restrição antiga
ALTER TABLE registro_atendimento DROP CONSTRAINT IF EXISTS registro_atendimento_modalidade_check;

-- 2. Aplicar a nova restrição CHECK
ALTER TABLE registro_atendimento ADD CONSTRAINT registro_atendimento_modalidade_check
    CHECK (modalidade IN ('Presencial', 'Online', 'Presencial com Professor'));
```

## 2. Nova Tabela `monitoria_professor`

Esta tabela armazena a senha temporária gerada pelo professor para validar a presença na aula correspondente.

```sql
CREATE TABLE IF NOT EXISTS monitoria_professor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID NOT NULL REFERENCES monitor(id) ON DELETE CASCADE,
    senha_aula TEXT NOT NULL,
    data_aula DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Fechado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices de performance para busca por data e professor
CREATE INDEX IF NOT EXISTS idx_monitoria_professor_data ON monitoria_professor(data_aula);
CREATE INDEX IF NOT EXISTS idx_monitoria_professor_prof_status ON monitoria_professor(professor_id, status);
```

## 3. Validações e Regras de Negócio no Banco

- **Validação de Código do Monitor**: 
  - Ao inserir na tabela `registro_atendimento`, a API validará no backend que os 4 últimos dígitos informados coincidem com `right(matricula, 4)` do monitor correspondente.
- **Validação de Presença com Professor**:
  - Se `modalidade = 'Presencial com Professor'`, o monitor associado deve possuir `role = 'professor'`.
  - O sistema buscará na tabela `monitoria_professor` uma linha onde `professor_id = monitor_id` AND `data_aula = CURRENT_DATE` AND `status = 'Ativo'` AND `senha_aula = [senha_informada]`. Se não encontrar, a transação/inserção falhará.
- **Acesso Administrativo (dashboard)**:
  - Usuários com `role` igual a `'gestor_fixo'` (como Josué, Bruno Gestor e Emmanuel Gestor inicialmente) ou `'gestor_temporario'` terão acesso total aos dados de auditoria, triagem e relatórios.
