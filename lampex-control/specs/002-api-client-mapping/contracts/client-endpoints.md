# Client Endpoints Contract (PostgREST Mapping)

Este documento define os esquemas e contratos consumidos pelo cliente TypeScript no LampexControl.

---

## 1. POST `/solicitacao_monitoria`

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
  },
  "status": "Pendente"
}
```

### Response (201 Created)
Retorna o objeto criado contendo o ID gerado.

---

## 2. POST `/rpc/submit_weekly_report`

RPC transacional pai-filho para submissão consolidada das atividades da semana de referência pelo monitor.

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

## 3. GET `/view_heatmap_disponibilidade`

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
