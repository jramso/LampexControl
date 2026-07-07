# API Endpoints Contract (Pages Functions & Axios Mapping)

Este documento define os esquemas, parâmetros e formatos de retorno consumidos pelo cliente Axios no LampexControl e processados pelas Cloudflare Pages Functions.

---

## 1. POST `/api/solicitacoes_monitoria`

Registra uma solicitação de monitoria por parte do aluno.

### Request Payload (JSON)
```json
{
  "nome_aluno": "João Silva",
  "email_aluno": "joao@example.com",
  "telefone_aluno": "27999999999",
  "cpf_aluno": "12345678901",
  "descricao_duvida": "Ajuda com estruturas de repetição em C",
  "formato": "Presencial",
  "horarios_disponiveis": {
    "dia": "Segunda-Feira",
    "bloco": "Matutino (08:00 - 12:00)"
  }
}
```

### Response (201 Created)
Retorna o objeto criado contendo o ID gerado e status inicial "Pendente".

---

## 2. POST `/api/rpc/registro_horas`

Submissão consolidada das atividades da semana de referência pelo monitor autenticado.

### Request Payload (JSON)
```json
{
  "semana_ref": "2026-07-06",
  "pdf_url": "https://storage.com/relatorio_semana1.pdf",
  "atividades": [
    {
      "tipo_atividade": "Monitoria",
      "horas_brutas": 4.0,
      "evidencia_url": "https://github.com/projeto/evidencia1"
    },
    {
      "tipo_atividade": "Desenvolvimento",
      "horas_brutas": 6.0,
      "evidencia_url": "https://github.com/projeto/evidencia2"
    }
  ]
}
```

### Response (200 OK)
Retorna o UUID do registro semanal criado:
```json
"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
```

---

## 3. GET `/api/view_reuniao_geral`

Retorna a matriz ponderada agregada das disponibilidades dos monitores ativos.

### Response (200 OK)
```json
[
  {
    "dia_semana": "Segunda-Feira",
    "bloco_horario": "Matutino",
    "peso_total": 4.5
  },
  {
    "dia_semana": "Terça-Feira",
    "bloco_horario": "Vespertino",
    "peso_total": 2.0
  }
]
```

---

## 4. GET `/api/view_contato_monitor`

Busca as informações de contato autorizadas pelo monitor para um agendamento validado.

### Query Parameters
* `id` (`eq.<UUID>`): Filtro para correspondência do chamado.
* `cpf_aluno` (`eq.<VARCHAR>`): Filtro para validação do CPF do aluno dono da solicitação.

### Response (200 OK)
Retorna as informações do monitor caso o chamado esteja no status "Confirmado" e o monitor permita exibir o contato:
```json
[
  {
    "chamado_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "monitor_nome": "Marcos Oliveira",
    "monitor_telefone": "27988888888",
    "monitor_plataforma": "WhatsApp"
  }
]
```
Se não autorizado ou chamado pendente, retorna um array vazio `[]` ou oculta os campos confidenciais com base na view do PostgreSQL.
