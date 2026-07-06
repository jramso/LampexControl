# Relational Data Model: Pages Functions Auth

Esta funcionalidade de migração não introduz novas entidades ou alterações de esquema nas tabelas existentes do banco de dados do LampexControl. 

A tabela principal utilizada para a validação das credenciais de acesso continua sendo a tabela `monitor`.

---

## 1. Entidades Reutilizadas

### Tabela `monitor`

Representa todos os membros do laboratório (monitores e gestores) cadastrados no sistema.

| Coluna | Tipo | Restrições / Índices | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do monitor no sistema. |
| `nome` | `TEXT` | `NOT NULL` | Nome completo do monitor. |
| `email` | `TEXT` | `UNIQUE`, `NOT NULL` | E-mail corporativo / acadêmico (ex: `@ifes.edu.br`). |
| `senha_hash` | `TEXT` | `NOT NULL` | Hash da senha gerado pela extensão `pgcrypto` (`crypt`). |
| `role` | `TEXT` | `DEFAULT 'monitor'`, `CHECK (role IN ('monitor', 'gestor'))` | Papel de privilégio do usuário no sistema. |
| `telefone` | `TEXT` | `NOT NULL` | Telefone de contato do monitor. |
| `permite_exibir_contato` | `BOOLEAN` | `DEFAULT FALSE` | Flag de consentimento LGPD para exibição de contato. |
| `plataforma_contato` | `TEXT` | `CHECK (plataforma_contato IN ('WhatsApp', 'Discord', 'Telegram', 'Outro'))` | Canal de preferência de contato. |

---

## 2. Índices e Performance

* **Índice Único em `email`**: Garante buscas instantâneas por e-mail com complexidade de tempo $O(1)$ na tabela `monitor` no momento da verificação do login.
