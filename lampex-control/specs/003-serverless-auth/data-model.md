# Data Model: Autenticação Serverless

Este documento descreve as entidades e o fluxo de dados envolvidos no processo de autenticação serverless do LampexControl.

---

## 1. Entidades Físicas (Existentes)

### Tabela: `monitor`
Representa os usuários registrados no sistema (monitores e gestores).

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY` | Identificador único gerado automaticamente. |
| `nome` | `text` | `NOT NULL` | Nome completo do usuário. |
| `email` | `text` | `UNIQUE`, `NOT NULL` | E-mail institucional ou cadastrado. |
| `senha_hash` | `text` | `NOT NULL` | Senha criptografada utilizando o algoritmo Blowfish (`bf` da extensão `pgcrypto`). |
| `role` | `text` | `NOT NULL` | Papel de acesso: `monitor` ou `gestor`. |

---

## 2. Modelos Lógicos e Estruturas de Dados

### Payload do JWT (JSON Web Token)
Dados decodificados contidos no token de autenticação emitido pelo Cloudflare Worker após login bem-sucedido.

* **Estrutura**:
  ```json
  {
    "id": "uuid-do-usuario",
    "email": "usuario@exemplo.com",
    "role": "gestor",
    "exp": 1783454279
  }
  ```

---

## 3. Fluxo de Validação de Credenciais
A validação de senha é executada via consulta no banco de dados utilizando a função `crypt` para comparar a senha informada com o hash armazenado:

```sql
SELECT id, role, email 
FROM monitor 
WHERE email = $1 AND senha_hash = crypt($2, senha_hash);
```
* **Caso coincida**: O Worker gera o token JWT assinado com o papel (`role`) e envia no corpo da resposta HTTP.
* **Caso não coincida**: Retorna erro de credenciais inválidas (HTTP 401).
