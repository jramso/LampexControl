# API Contract: Autenticação Serverless

Contrato de comunicação para os endpoints expostos pelo Cloudflare Workers na rota `/api/auth/*`.

---

## 1. POST `/api/auth/login`
Autentica o usuário e retorna o token JWT assinado para controle de sessão.

* **Headers**:
  * `Content-Type: application/json`

* **Request Body (JSON)**:
  ```json
  {
    "email": "josue.rsou2@gmail.com",
    "password": "senha_de_teste"
  }
  ```

* **Respostas**:

  ### 200 OK
  Autenticação realizada com sucesso. Retorna o token JWT de acesso.
  * **Content-Type**: `application/json`
  * **Corpo**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIyZjM2NGNmLTc5NzktNDk1ZS1hZWM5LTE1ZjQyNjliZTJiYyIsImVtYWlsIjoianN1ZS5yc291MkBnbWFpbC5jb20iLCJyb2xlIjoiZ2VzdG9yIiwiZXhwIjoxNzgzNDU0Mjc5fQ..."
    }
    ```

  ### 400 Bad Request
  Requisição inválida (e-mail ou senha ausentes).
  * **Content-Type**: `application/json`
  * **Corpo**:
    ```json
    {
      "error": "E-mail e senha são obrigatórios."
    }
    ```

  ### 401 Unauthorized
  Credenciais incorretas (e-mail inexistente ou senha incorreta).
  * **Content-Type**: `application/json`
  * **Corpo**:
    ```json
    {
      "error": "E-mail ou senha incorretos."
    }
    ```
