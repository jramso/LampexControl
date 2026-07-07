# Research & Decision Log: Fluxo de Triagem de Voluntários

## Decisions

### 1. Roteamento de APIs Customizado no Worker

- **Decision**: Estender o roteador customizado existente em [index.ts](file:///C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/lampex-control-api/src/index.ts) utilizando o particionamento do pathname (`resource.split('/')`).
- **Rationale**: O backend atual não utiliza frameworks de roteamento externos (como Hono ou Itty Router), mas sim uma lógica de correspondência de strings simples. Estender essa estrutura mantém a consistência arquitetônica e evita a introdução de novas dependências de terceiros.
- **Alternatives considered**: Introduzir Hono.js. Embora Hono simplifique o roteamento dinâmico, ele exigiria reescrever o middleware de CORS e JWT, aumentando a complexidade do PR.

### 2. Transações de Banco de Dados para Aprovação de Voluntários

- **Decision**: Utilizar uma transação SQL explícita (`BEGIN`, `COMMIT`, `ROLLBACK`) no driver do `pg` ao aprovar um voluntário e migrá-lo para a tabela `monitor`.
- **Rationale**: A triagem e a criação do monitor são operações interdependentes. Se a inserção na tabela `monitor` falhar (por exemplo, devido a um e-mail duplicado), o status do voluntário não deve mudar para `'Aprovado'`. Uma transação garante a atomicidade e consistência relacional.
- **Alternatives considered**: Executar queries separadas sem transação. Rejeitado devido ao risco de inconsistência de dados (voluntário marcado como aprovado sem conta de monitor criada).

### 3. Mecanismo de Senha Inicial para Monitores Aprovados

- **Decision**: Gerar uma senha inicial padrão seguindo o padrão `Lampex@<matricula>` e aplicar o hash `crypt` com `gen_salt('bf')` (bcrypt) diretamente no PostgreSQL da Aiven via `pgcrypto`.
- **Rationale**: Garante que o usuário possua uma senha inicial determinística baseada em seus próprios dados (matrícula) que atende aos requisitos de autenticação do sistema, eliminando a necessidade de um serviço de envio de e-mails para reset de senha (o que violaria o princípio de manter a arquitetura 100% no plano gratuito e sem infraestrutura complexa).
- **Alternatives considered**:
  - Gerar senha aleatória e enviar por e-mail: Rejeitado por exigir serviço SMTP externo.
  - Cadastrar sem senha e exigir reset: Rejeitado por complexidade adicional de fluxos de primeiro acesso.

### 4. Chamadas HTTP no Frontend para Rotas Customizadas

- **Decision**: Utilizar `fetch` nativo no frontend para interagir com os endpoints customizados `/voluntarios/*`, ao invés do `PostgrestClient` do Supabase.
- **Rationale**: O `PostgrestClient` é ideal para mapear requisições diretamente às tabelas do PostgREST. No entanto, nossas rotas de aprovação e listagem contêm lógica de negócios específica que não mapeia 1-to-1 de forma simples via client padrão (como a transação relacional). Utilizar `fetch` nativo com o token JWT manual é simples, direto e robusto.
- **Alternatives considered**: Forçar o uso de RPCs no PostgrestClient. Rejeitado porque o cliente atual já é configurado apontando para a raiz do Worker que customiza a rota.
