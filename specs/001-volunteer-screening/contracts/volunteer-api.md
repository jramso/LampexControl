# API Contracts: Fluxo de Triagem de Voluntários

## Public Endpoints

### 1. Cadastro de Voluntário

Registra um novo candidato na triagem.

- **URL**: `/api/voluntarios/cadastro` (ou `/voluntarios/cadastro`)
- **Method**: `POST`
- **Authentication**: Nenhuma (Público)
- **Headers**:
  - `Content-Type: application/json`

#### Request Payload

```json
{
  "nome": "João Silva",
  "email": "joao.silva@example.com",
  "cpf": "12345678901",
  "telefone": "27999999999",
  "curso": "Engenharia de Controle e Automação",
  "matricula": "2026123456",
  "origem_cadastro": "Instagram"
}
```

#### Response (201 Created)

```json
{
  "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "nome": "João Silva",
  "email": "joao.silva@example.com",
  "cpf": "12345678901",
  "telefone": "27999999999",
  "curso": "Engenharia de Controle e Automação",
  "matricula": "2026123456",
  "origem_cadastro": "Instagram",
  "status_aprovacao": "Pendente",
  "created_at": "2026-07-07T20:00:00Z"
}
```

#### Response (400 Bad Request)

Exemplo de erro de validação (campos vazios ou inválidos):

```json
{
  "error": "Todos os campos obrigatórios devem ser preenchidos e válidos."
}
```

#### Response (409 Conflict)

Exemplo de duplicidade (e-mail, CPF ou matrícula já existentes):

```json
{
  "error": "E-mail, CPF ou Matrícula já cadastrados no sistema."
}
```

---

## Protected Endpoints (Gestor JWT Required)

### 2. Listar Voluntários Pendentes

Obtém a lista de todos os potenciais voluntários com status `'Pendente'`.

- **URL**: `/api/voluntarios/pendentes` (ou `/voluntarios/pendentes`)
- **Method**: `GET`
- **Authentication**: JWT Requerido (Bearer Token)
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`

#### Response (200 OK)

```json
[
  {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "nome": "João Silva",
    "email": "joao.silva@example.com",
    "cpf": "12345678901",
    "telefone": "27999999999",
    "curso": "Engenharia de Controle e Automação",
    "matricula": "2026123456",
    "origem_cadastro": "Instagram",
    "status_aprovacao": "Pendente",
    "created_at": "2026-07-07T20:00:00Z"
  }
]
```

#### Response (401 Unauthorized / 403 Forbidden)

Retornado se o token não for enviado, expirar, ou se o usuário não contiver a role `'gestor'`.

```json
{
  "error": "Não autorizado."
}
```

---

### 3. Aprovar Voluntário por ID

Aprova o candidato, atualiza seu status para `'Aprovado'` e o migra para a tabela `monitor` com `role = 'monitor'`.

- **URL**: `/api/voluntarios/:id/aprovar`
- **Method**: `POST`
- **Authentication**: JWT Requerido (Bearer Token de Gestor)
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Candidato aprovado e monitor criado com sucesso.",
  "monitor_id": "b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"
}
```

#### Response (404 Not Found)

Retornado se o ID do candidato não for encontrado ou já tiver sido processado.

```json
{
  "error": "Candidato não encontrado ou já processado."
}
```

---

### 4. Rejeitar Voluntário por ID

Rejeita o candidato, atualizando seu status para `'Rejeitado'` na tabela de triagem.

- **URL**: `/api/voluntarios/:id/rejeitar`
- **Method**: `POST`
- **Authentication**: JWT Requerido (Bearer Token de Gestor)
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Candidato rejeitado com sucesso."
}
```
