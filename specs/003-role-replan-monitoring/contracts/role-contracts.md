# API Contracts: Replanejamento de Cargos e Monitoria com Professor

Este documento define as alterações nos contratos de dados das APIs de atendimento, monitor, e monitoria com professor.

---

## 1. Registro de Atendimento (Público)

### `POST /api/atendimentos/registrar`

Registra a validação do atendimento feita pelo aluno. Para monitorias normais, valida a matrícula do monitor. Para monitorias com professor, valida o código da matrícula do professor e a senha da aula ativa.

- **Autenticação**: Nenhuma (Público).
- **Content-Type**: `application/json`

#### Request Body (Caso de Presencial com Professor)
```json
{
  "monitor_id": "8f8b898d-8a8b-8c8d-8e8f-909192939495",
  "matricula": "2026102030",
  "nome": "Amanda Oliveira Silva",
  "modalidade": "Presencial com Professor",
  "local_ou_link": "Sala de Aula 12",
  "horas_duracao": 2.0,
  "codigo_monitor": "1234",
  "senha_aula": "aula_code_123"
}
```

#### Responses

- **201 Created**: Registro inserido com sucesso.
- **400 Bad Request**: Código do monitor incorreto, ou senha de aula incorreta/expirada para "Presencial com Professor".
  ```json
  {
    "error": "Código do monitor inválido."
  }
  ```
  Ou:
  ```json
  {
    "error": "Senha de aula inválida, expirada ou inexistente para o dia de hoje."
  }
  ```

---

## 2. Atualização de Monitor / Atribuição de Cargo (Protegido)

### `PATCH /api/monitor?id=eq.{id}`

Permite atualizar o perfil do monitor ou promover um monitor/voluntário para gestor temporário.

- **Autenticação**: Requer JWT (Bearer Token) com `role = 'gestor_fixo'`.

#### Request Body
```json
{
  "role": "gestor_temporario"
}
```

#### Responses

- **200 OK**: Role atualizada com sucesso.

---

## 3. Gerenciamento de Aulas do Professor (Protegido)

Estes endpoints permitem ao professor criar e encerrar senhas de aula diárias.

### `POST /api/monitoria-professor`
Cria uma nova senha de aula ativa para o dia de hoje.

- **Autenticação**: Requer JWT (Bearer Token) com `role = 'professor'`.
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "senha_aula": "aula_code_123"
}
```

#### Responses
- **201 Created**: Aula registrada e ativa.
  ```json
  {
    "id": "e5b5e5b5-e5b5-e5b5-e5b5-e5b5e5b5e5b5",
    "professor_id": "8f8b898d-8a8b-8c8d-8e8f-909192939495",
    "senha_aula": "aula_code_123",
    "data_aula": "2026-07-09",
    "status": "Ativo",
    "created_at": "2026-07-09T08:00:00.000Z"
  }
  ```

---

### `GET /api/monitoria-professor`
Lista as aulas registradas pelo professor autenticado.

- **Autenticação**: Requer JWT (Bearer Token) com `role = 'professor'`.

#### Responses
- **200 OK**:
  ```json
  [
    {
      "id": "e5b5e5b5-e5b5-e5b5-e5b5-e5b5e5b5e5b5",
      "senha_aula": "aula_code_123",
      "data_aula": "2026-07-09",
      "status": "Ativo"
    }
  ]
  ```

---

### `PATCH /api/monitoria-professor?id=eq.{id}`
Fecha manualmente o recebimento de presenças para a aula especificada.

- **Autenticação**: Requer JWT (Bearer Token) com `role = 'professor'`.

#### Request Body
```json
{
  "status": "Fechado"
}
```

#### Responses
- **200 OK**: Aula fechada com sucesso.
