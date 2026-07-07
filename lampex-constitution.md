<!--
SYNC IMPACT REPORT
- Version change: 0.0.0 (Template) -> 1.0.0
- Modified principles:
  - PRINCIPLE_1: I. Desacoplamento Estrito do Ecossistema
  - PRINCIPLE_2: II. Banco de Dados PostgreSQL Centralizado na Nuvem
  - PRINCIPLE_3: III. Modelo de Autenticação Centrado na Tabela Monitor
  - PRINCIPLE_4: IV. Credencial Administrativa Root Fixada
  - PRINCIPLE_5: V. Arquitetura 100% Free-Tier e Sem Servidor VPS Pago
- Added sections:
  - Segurança e Prevenção de Falhas de CORS
  - Conformidade e Governança com SpecKit
- Templates requiring updates:
  - C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/.specify/templates/plan-template.md (✅ updated)
  - C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/.specify/templates/spec-template.md (✅ updated)
  - C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/.specify/templates/tasks-template.md (✅ updated)
- Follow-up TODOs: None
-->

# LampexControl Constitution

## Core Principles

### I. Desacoplamento Estrito do Ecossistema
O ecossistema é estritamente dividido em dois subprojetos independentes: o frontend hospedado no Cloudflare Pages em [/lampex-control](./lampex-control) (desenvolvido em Vue 3, TypeScript e Vite) e o backend hospedado no Cloudflare Workers em [/lampex-control-api](./lampex-control-api) (desenvolvido em TypeScript utilizando Wrangler). Toda a comunicação entre eles deve ocorrer através de requisições HTTPS.

### II. Banco de Dados PostgreSQL Centralizado na Nuvem
Toda a persistência de dados do sistema reside em uma única instância PostgreSQL gerenciada na nuvem da Aiven. A conexão com o banco de dados é feita via Hyperdrive em ambiente de produção ou de forma direta com SSL obrigatório (`sslmode=require`), garantindo segurança dos dados trafegados.

### III. Modelo de Autenticação Centrado na Tabela Monitor
Não existe uma tabela genérica ou dedicada de usuários. O controle de acesso e autenticação é gerenciado estritamente através da tabela `monitor`. A coluna `role` aceita apenas os valores `'monitor'` ou `'gestor'`, que ditam os níveis de acesso e privilégios dos usuários.

### IV. Credencial Administrativa Root Fixada
O usuário administrador root e gestor padrão do sistema é `Josué Ramos Souza` (email: `josue.rsou2@gmail.com`), cuja senha base criptografada cadastrada no banco é `lam_23!@` e a role definida é `'gestor'`. Qualquer lógica de autenticação padrão deve validar as permissões contra esse perfil para as ações administrativas de nível superior.

### V. Arquitetura 100% Free-Tier e Sem Servidor VPS Pago
O deploy, infraestrutura de banco e computação serveless do projeto devem ser implementados usando apenas opções e planos gratuitos de provedores cloud (Cloudflare e Aiven). A utilização de servidores VPS pagos para hospedagem ou execução de processos contínuos é estritamente proibida.

## Segurança e Prevenção de Falhas de CORS

Todas as rotas públicas e autenticadas fornecidas pelo backend `/lampex-control-api` devem ser devidamente protegidas contra falhas de CORS (Cross-Origin Resource Sharing), implementando e anexando os cabeçalhos apropriados de CORS (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`) em todas as respostas de API, incluindo o tratamento explícito de requisições de preflight (`OPTIONS`).

## Conformidade e Governança com SpecKit

Toda e qualquer alteração de código, proposta de design ou nova funcionalidade planejada pelo SpecKit em qualquer subpasta do repositório deve herdar e respeitar estritamente as diretrizes contidas neste documento. O descumprimento de qualquer princípio da constituição constitui uma quebra de governança e impedirá a validação e o deploy automático das alterações.

## Governance

1. Qualquer alteração ou nova funcionalidade deve passar por um "Constitution Check" nas fases de planejamento do SpecKit.
2. Violações de arquitetura devem ser explicitamente justificadas e registradas no campo `Complexity Tracking` dos planos de implementação, sujeitas à aprovação do mantenedor.
3. A modificação deste documento incrementará a versão da constituição e exigirá a ratificação por parte do proprietário.

**Version**: 1.0.0 | **Ratified**: 2026-07-07 | **Last Amended**: 2026-07-07
