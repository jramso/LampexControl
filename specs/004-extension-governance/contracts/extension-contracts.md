# API Contracts: Governança de Ações de Extensão

Este documento descreve os contratos de dados e as alterações de endpoints introduzidas nesta sprint.

---

## 1. Listagem de Ações de Extensão

### `GET /api/acao_extensao`
Lista todas as Ações de Extensão cadastradas no sistema. Pode ser filtrada pelo status da ação.

- **Autenticação**: Nenhuma (Público, consumido pelo formulário da Monitoria Rápida).
- **Parâmetros de Consulta**:
  - `status_acao`: Ex: `status_acao=eq.Ativa`

#### Response (200 OK)
```json
[
  {
    "id": "11111111-2222-3333-4444-555555555555",
    "nome_acao": "Projeto Include - Robótica nas Escolas",
    "descricao": "Capacitação em robótica para alunos do ensino fundamental e médio.",
    "codigo_src": "ROBOTICA_2026",
    "status_acao": "Ativa",
    "created_at": "2026-07-09T10:00:00.000Z"
  },
  {
    "id": "a9a9a9a9-b9b9-c9c9-d9d9-e9e9e9e9e9e9",
    "nome_acao": "Projeto Fábrica de Software",
    "descricao": "Desenvolvimento de sistemas para entidades sem fins lucrativos.",
    "codigo_src": "FABRICA_2026",
    "status_acao": "Ativa",
    "created_at": "2026-07-09T10:30:00.000Z"
  }
]
```

---

## 2. Registro de Atendimento (Público)

### `POST /api/atendimentos/registrar`
Atualizado para exigir a propriedade `acao_id` e realizar validações adicionais.

- **Autenticação**: Nenhuma.
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "monitor_id": "8f8b898d-8a8b-8c8d-8e8f-909192939495",
  "matricula": "2026102030",
  "nome": "Amanda Oliveira Silva",
  "modalidade": "Presencial",
  "local_ou_link": "Laboratório 205",
  "horas_duracao": 1.5,
  "codigo_monitor": "1234",
  "acao_id": "11111111-2222-3333-4444-555555555555"
}
```

*Nota para a modalidade `'Presencial com Professor'`: O request body deve também conter `"senha_aula"` (que será validada contra a `senha_sessao` ativa do dia correspondente ao professor selecionado).*

#### Responses
- **201 Created**: Registro inserido com sucesso.
  ```json
  {
    "id": "b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3",
    "monitor_id": "8f8b898d-8a8b-8c8d-8e8f-909192939495",
    "matricula": "2026102030",
    "nome": "Amanda Oliveira Silva",
    "modalidade": "Presencial",
    "local_ou_link": "Laboratório 205",
    "horas_duracao": 1.5,
    "acao_id": "11111111-2222-3333-4444-555555555555",
    "senha_sessao": null,
    "professor_id": null,
    "created_at": "2026-07-09T13:30:00.000Z"
  }
  ```
- **400 Bad Request**:
  ```json
  {
    "error": "Todos os campos são obrigatórios, incluindo o código do monitor e a ação de extensão."
  }
  ```
  Ou:
  ```json
  {
    "error": "Código do monitor inválido."
  }
  ```

---

## 3. Relatório de Produtividade dos Voluntários

### `GET /api/relatorios/monitores`
Retorna as horas acumuladas por voluntários e professores, agrupadas por Ação de Extensão.

- **Autenticação**: Requer JWT (Gestor).
- **Parâmetros de Consulta**: `start_date`, `end_date`.

#### Response (200 OK)
```json
[
  {
    "acao_id": "11111111-2222-3333-4444-555555555555",
    "acao_nome": "Projeto Include - Robótica nas Escolas",
    "monitor_id": "8f8b898d-8a8b-8c8d-8e8f-909192939495",
    "monitor_nome": "Josué Ramos Souza",
    "horas_planejamento": "12.00"
  },
  {
    "acao_id": "a9a9a9a9-b9b9-c9c9-d9d9-e9e9e9e9e9e9",
    "acao_nome": "Projeto Fábrica de Software",
    "monitor_id": "cdcdcdcd-cdcd-cdcd-cdcd-cdcdcdcdcdcd",
    "monitor_nome": "Bruno Gestor",
    "horas_planejamento": "8.50"
  }
]
```

---

## 4. Relatório de Consumo de Horas (Alunos)

### `GET /api/relatorios/alunos`
Retorna as horas consumidas por estudantes, agrupadas por Ação de Extensão.

- **Autenticação**: Requer JWT (Gestor).
- **Parâmetros de Consulta**: `start_date`, `end_date`.

#### Response (200 OK)
```json
[
  {
    "acao_id": "11111111-2222-3333-4444-555555555555",
    "acao_nome": "Projeto Include - Robótica nas Escolas",
    "matricula": "2026102030",
    "nome": "Amanda Oliveira Silva",
    "horas_consumidas": "6.00"
  },
  {
    "acao_id": "a9a9a9a9-b9b9-c9c9-d9d9-e9e9e9e9e9e9",
    "acao_nome": "Projeto Fábrica de Software",
    "matricula": "2026102030",
    "nome": "Amanda Oliveira Silva",
    "horas_consumidas": "3.25"
  }
]
```
