# API Contracts: Validação de Atendimentos via QR Code

Este documento define os contratos de dados para comunicação via HTTPS entre o frontend (`/lampex-control`) e a API backend (`/lampex-control-api`).

---

## 1. Registro de Atendimento (Público)

### `POST /api/atendimentos/registrar`
Registra a validação do atendimento feita pelo aluno.

- **Autenticação**: Nenhuma (Público).
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "monitor_id": "8f8b898d-8a8b-8c8d-8e8f-909192939495",
  "matricula": "2026102030",
  "nome": "Amanda Oliveira Silva",
  "modalidade": "Presencial",
  "local_ou_link": "Laboratório de Redes - Sala 102",
  "horas_duracao": 1.5
}
```

#### Responses

- **201 Created**: Registro inserido com sucesso.
  ```json
  {
    "id": "e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2",
    "monitor_id": "8f8b898d-8a8b-8c8d-8e8f-909192939495",
    "matricula": "2026102030",
    "nome": "Amanda Oliveira Silva",
    "modalidade": "Presencial",
    "local_ou_link": "Laboratório de Redes - Sala 102",
    "horas_duracao": 1.5,
    "created_at": "2026-07-08T15:15:00.000Z"
  }
  ```

- **400 Bad Request**: Campos obrigatórios ausentes ou valores inválidos.
  ```json
  {
    "error": "Duração inválida ou campos obrigatórios ausentes."
  }
  ```

---

## 2. Relatório de Produtividade dos Monitores (Protegido)

### `GET /api/relatorios/monitores`
Retorna a soma de horas trabalhadas pelos monitores multiplicada pelo fator regulamentar de planejamento (2x).

- **Autenticação**: Requer JWT (Bearer Token) com a role de `'gestor'`.
- **Query Parameters**:
  - `start_date` (opcional): Data inicial da filtragem (formato `YYYY-MM-DD`).
  - `end_date` (opcional): Data final da filtragem (formato `YYYY-MM-DD`).

#### Responses

- **200 OK**: Lista de produtividade retornada.
  ```json
  [
    {
      "monitor_id": "8f8b898d-8a8b-8c8d-8e8f-909192939495",
      "monitor_nome": "João Pedro Santos",
      "horas_planejamento": 18.00
    },
    {
      "monitor_id": "9a9b9c9d-9e9f-0a0b-0c0d-0e0f1a1b1c1d",
      "monitor_nome": "Maria Eduarda Lima",
      "horas_planejamento": 12.50
    }
  ]
  ```

- **401 Unauthorized / 403 Forbidden**: Token ausente, inválido ou privilégios de acesso insuficientes.
  ```json
  {
    "error": "Acesso negado. Apenas gestores podem visualizar relatórios."
  }
  ```

---

## 3. Relatório de Consumo dos Alunos (Protegido)

### `GET /api/relatorios/alunos`
Retorna o consumo total de horas reais de atendimento por matrícula e nome do aluno (sem fator multiplicador).

- **Autenticação**: Requer JWT (Bearer Token) com a role de `'gestor'`.
- **Query Parameters**:
  - `start_date` (opcional): Data inicial da filtragem (formato `YYYY-MM-DD`).
  - `end_date` (opcional): Data final da filtragem (formato `YYYY-MM-DD`).

#### Responses

- **200 OK**: Lista de consumo de alunos retornada.
  ```json
  [
    {
      "matricula": "2026102030",
      "nome": "Amanda Oliveira Silva",
      "horas_consumidas": 9.00
    },
    {
      "matricula": "2026112233",
      "nome": "Lucas Martins Costa",
      "horas_consumidas": 4.50
    }
  ]
  ```

- **401 Unauthorized / 403 Forbidden**: Token ausente, inválido ou privilégios de acesso insuficientes.
  ```json
  {
    "error": "Acesso negado. Apenas gestores podem visualizar relatórios."
  }
  ```
