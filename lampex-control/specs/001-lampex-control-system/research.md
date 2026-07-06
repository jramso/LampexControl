# Research Notes: LampexControl System

Este documento detalha as decisões técnicas, justificativas e alternativas analisadas para a arquitetura do sistema LampexControl.

---

## 1. Fluxo de Autenticação JWT no PostgREST

* **Decisão**: Utilização de uma função de banco de dados PostgreSQL (`rpc/login`) exposta pelo PostgREST. A função valida as credenciais do usuário contra a tabela de credenciais (usando hashes seguros via extensão `pgcrypto`) e assina um token JWT contendo a `role` e o `email` do usuário. Esse JWT é retornado ao frontend Vue 3, que o armazena no `localStorage` e o anexa no header `Authorization: Bearer <token>` em requisições subsequentes.
* **Racional**: PostgREST consome nativamente tokens JWT assinados com um segredo configurado na inicialização. Gerar e assinar o token diretamente no PostgreSQL elimina a necessidade de um servidor de autenticação intermediário, alinhando-se perfeitamente com a restrição arquitetural de MVC desacoplado.
* **Alternativas Consideradas**:
  1. *Autenticação Externa (Supabase Auth / Firebase)*: Descartada para manter a solução hospedada de forma independente e centralizada na Aiven.
  2. *Autenticação de camada média (NodeJS)*: Violaria a premissa de manter o banco de dados e PostgREST como únicos controladores de dados.

---

## 2. Controle de Acesso e Armazenamento de Arquivos PDF

* **Decisão**: Armazenamento de arquivos em um serviço de Object Storage compatível com S3 (ex: Aiven Object Storage ou AWS S3). A geração do link de upload e de leitura de documentos sensíveis (Proex PDFs e evidências de execução) é controlada por uma função de banco de dados (RPC) que valida o token JWT do usuário, gerando uma URL temporária assinada (Signed URL) apenas se o usuário for o proprietário do relatório ou um gestor do laboratório.
* **Racional**: Cumpre a exigência da LGPD (FR-010). Evita o armazenamento direto de binários no banco de dados (que degradaria a performance de leitura do PostgreSQL) ao mesmo tempo que impede o acesso não autorizado a links estáticos.
* **Alternativas Consideradas**:
  1. *Arquivos Públicos com Nomes Hash*: Salvar os arquivos em pastas públicas com nomes aleatórios gerados. Descartado por ser inseguro (os arquivos ainda estariam publicamente expostos na internet via força bruta ou vazamento do link).
  2. *Armazenamento de Binários (Bytea) no Banco*: Descartado por questões de escala e performance do PostgreSQL em Aiven.

---

## 3. Transações de Submissão Unificada (Pai e Filhos)

* **Decisão**: Implementação de uma função de banco de dados (RPC) `submit_weekly_report(semana_ref DATE, pdf_url TEXT, atividades JSON)` que executa a transação completa no PostgreSQL. Ela insere o registro pai (`RegistroSemanal`), recupera o ID gerado, e faz o parsing do array JSON de atividades para inseri-las em lote na tabela `ItemAtividade`, tudo em uma única transação atômica.
* **Racional**: Garante a integridade referencial e transacional dos dados, evitando estados órfãos (como registrar atividades sem o relatório pai correspondente) devido a falhas de conexão durante requisições HTTP sucessivas.
* **Alternativas Consideradas**:
  1. *Múltiplas requisições sequenciais do frontend*: O frontend insere o pai, aguarda o ID e insere cada filho individualmente. Descartado devido ao risco de inconsistências de rede e violação da atomicidade da transação.

---

## 4. Agregação e Processamento do Mapa de Calor

* **Decisão**: Criação de uma View Materializada ou View Comum no PostgreSQL (`view_heatmap_disponibilidade`) que consolida as disponibilidades individuais dos monitores. Ela agrupa as linhas por `dia_semana` e `bloco_horario` e faz a média aritmética ou soma ponderada dos pesos (Presencial = 1.0, Online = 0.5, Indisponível = 0.0), disponibilizando um dataset pronto para o frontend consumir diretamente em uma única requisição GET.
* **Racional**: Desloca toda a computação pesada de agregação de matrizes para o banco de dados. O frontend Vue 3 precisa apenas ler o resultado e renderizar os quadrados coloridos na matriz, garantindo renderização instantânea (SC-004) e simplicidade no código do cliente.
* **Alternativas Consideradas**:
  1. *Agregação em Memória no Frontend*: O frontend baixa a grade de disponibilidade de cada um dos monitores e realiza o cruzamento de arrays em Javascript. Descartado devido ao alto consumo de rede (download de múltiplos objetos grandes) e degradação de performance em computadores cliente.
