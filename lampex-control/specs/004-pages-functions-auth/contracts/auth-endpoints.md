# API Contract: Pages Functions Auth

Este documento define o contrato do endpoint de login fornecido pelo Cloudflare Pages Functions.

---

## 1. Login Endpoint

Autentica um usuário e emite um token JWT de acesso.

* **Rota**: `/api/auth/login` (caminho relativo)
* **Método**: `POST`
* **Headers de Requisição**:
  * `Content-Type`: `application/json`

### Body de Requisição (JSON)

```json
{
  "email": "josue.rsou2@gmail.com",
  "password": "correct_password"
}
```

---

## 2. Respostas Esperadas

### 200 OK (Sucesso)
Retornado quando as credenciais são validadas com sucesso no banco Aiven.

* **Headers**:
  * `Content-Type`: `application/json`
* **Body**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFhMmIzYyIsImVtYWlsIjoiam9zdWUucnNvdTIyQGdtYWlsLmNvbSIsInJvbGUiOiJnZXN0b3IiLCJleHAiOjE3MTk2MTkyMDB9.signature"
  }
  ```

---

### 400 Bad Request (Parâmetros Ausentes)
Retornado quando o e-mail ou a senha não são enviados no corpo da requisição.

* **Body**:
  ```json
  {
    "error": "E-mail e senha são obrigatórios."
  }
  ```

---

### 401 Unauthorized (Credenciais Inválidas)
Retornado se o e-mail não existir ou a senha informada não conferir com o hash no banco.

* **Body**:
  ```json
  {
    "error": "E-mail ou senha incorretos."
  }
  ```

---

### 500 Internal Server Error (Erro do Servidor)
Retornado se houver falha de rede ou configuração de banco no Pages Function.

* **Body**:
  ```json
  {
    "error": "Erro interno do servidor: [mensagem_do_erro]"
  }
  ```
