# Quickstart Validation Guide: LampexControl System

Este guia descreve os cenários de validação executáveis para certificar o funcionamento de ponta a ponta do sistema LampexControl, cobrindo os fluxos críticos de monitoria, registro semanal de atividades com cálculo de horas e auditoria de horas.

---

## 1. Pré-requisitos e Setup

### Dependências Tecnológicas
- **Banco de Dados**: PostgreSQL 15+ rodando na nuvem Aiven (ou local para testes).
- **Barramento de API**: PostgREST 12+ conectado ao banco.
- **Frontend**: Node.js v18+, Vite e Vue 3 instalados no ambiente local.

### Passos de Configuração do Ambiente
1. **Banco de Dados**:
   Aplique os scripts de migração disponíveis em `db/migrations/` na instância do banco PostgreSQL na Aiven para gerar as tabelas, relacionamentos e triggers.
2. **PostgREST**:
   Configure o PostgREST com o segredo do JWT e a URI da conexão com o banco Aiven.
3. **Instalação do Frontend**:
   Execute na raiz do projeto:
   ```bash
   npm install
   ```
4. **Geração de Tipos Estáticos**:
   Gere o arquivo `src/services/schema.ts` a partir do contrato OpenAPI [openapi.json](file:///C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/lampex-control/specs/001-lampex-control-system/contracts/openapi.json) com o comando CLI:
   ```bash
   npx openapi-typescript specs/001-lampex-control-system/contracts/openapi.json --output src/services/schema.ts
   ```

---

## 2. Cenários de Validação de Ponta a Ponta

### Cenário 1: Solicitação de Monitoria e Visualização de Contato Seguro (Aluno → Monitor)
- **Objetivo**: Testar se o aluno consegue submeter uma solicitação e visualizar as informações de contato do monitor somente após a confirmação pela coordenação (FR-001, FR-003, FR-010).
- **Ações**:
  1. No frontend, navegue até a Home e acesse o formulário de monitoria.
  2. Preencha os campos obrigatórios (incluindo CPF e dados de contato do aluno) e envie.
  3. Verifique no banco PostgreSQL (ou via endpoint `/solicitacao_monitoria`) que o chamado foi inserido com `status = 'Pendente'`.
  4. Tente consultar os dados de contato do monitor a partir da tela de status do aluno e confirme que estão ocultos.
  5. Logue como Gestor, acesse a fila e confirme o agendamento vinculando um Monitor.
  6. Como Aluno, atualize a tela de status e confirme que as informações de contato do monitor (ex: WhatsApp ou link de perfil) agora estão visíveis conforme as opções de privacidade definidas no cadastro do monitor.

### Cenário 2: Submissão de Registro Semanal e Cálculo Automático de Horas (Monitor)
- **Objetivo**: Validar a submissão atômica de múltiplas atividades semanais e a aplicação correta dos pesos do LAMPEX (FR-004, FR-005, FR-006).
- **Ações**:
  1. Logue no sistema como Monitor utilizando e-mail e senha.
  2. Navegue até a tela de Registro de Atividades.
  3. Insira a semana de referência, faça upload do PDF Proex e adicione duas atividades na mesma tela:
     - **Atividade 1**: Tipo = `Monitoria`, Horas Brutas = `4.0`.
     - **Atividade 2**: Tipo = `Minicurso com Material`, Horas Brutas = `2.0`.
  4. Clique em enviar.
  5. Verifique no banco de dados que as duas atividades foram inseridas na tabela `item_atividade` vinculadas ao mesmo `registro_semanal` pai.
  6. Confirme que os multiplicadores foram aplicados corretamente nas horas líquidas via trigger:
     - **Atividade 1**: 4.0 horas brutas $\times$ 2 = **8.0 horas líquidas**.
     - **Atividade 2**: 2.0 horas brutas $\times$ 3 = **6.0 horas líquidas**.

### Cenário 3: Auditoria de Horas com Histórico de Gestores (Gestão)
- **Objetivo**: Validar a capacidade do gestor de auditar, aprovar/recusar em lote, e manter um histórico mutável (FR-007, FR-012).
- **Ações**:
  1. Logue como Gestor e acesse o Painel de Auditoria.
  2. Visualize o lote de registros semanais pendentes com os relatórios em PDF e links de evidência side-by-side.
  3. Clique em **Aprovar Lote**.
  4. Verifique que um registro foi criado na tabela `historico_auditoria` mapeando o `gestor_id` ativo, a data/hora e o status `Aprovado`.
  5. Como Gestor, atualize o status de um dos relatórios do lote de `Aprovado` para `Recusado` informando a justificativa.
  6. Verifique que o histórico de auditoria foi modificado, mantendo a integridade das ações de auditoria.

### Cenário 4: Mapa de Calor de Disponibilidade
- **Objetivo**: Validar a consolidação e renderização do heatmap de reuniões a partir das matrizes de horários (FR-002, FR-008).
- **Ações**:
  1. Insira matrizes de disponibilidade para pelo menos 3 monitores no sistema com pesos variados (1.0 para presencial, 0.5 para online).
  2. Logue como Gestor e acesse a tela do Mapa de Calor.
  3. Verifique se o sistema consome a view de agrupamento `/view_heatmap_disponibilidade` e exibe de forma visual os horários ideais de reuniões.
