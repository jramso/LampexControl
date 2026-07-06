# Especificação do Projeto: LampexControl

O **LampexControl** é um sistema web acadêmico estruturado no padrão **MVC (Model-View-Controller)** e desenvolvido sob a abordagem **Spec-driven**. O objetivo é gerenciar as atividades, disponibilidades e o registro de horas do Laboratório Modelo de Práticas de Extensão (LAMPEX) do Ifes campus Serra.

O sistema elimina processos manuais em planilhas e formulários , automatizando regras normativas de certificação da Proex e do regulamento interno do laboratório.

## 1. Arquitetura Técnica e Infraestrutura

A aplicação adota uma arquitetura desacoplada onde o backend é gerado automaticamente a partir do banco de dados:

- **Model (Modelo):** Banco de dados relacional **PostgreSQL** hospedado na nuvem através da **Aiven**. Toda a inteligência de agregação de dados, restrições de integridade e cálculos de peso de horas reside em Views e Triggers diretamente no banco.
    
- **Controller (Controlador):** Gerenciado de forma transparente pelo **PostgREST**. O PostgREST se conecta à instância da Aiven, lê o esquema das tabelas e expõe instantaneamente uma API RESTful documentada via padrão **OpenAPI (Swagger)**.
    
- **View (Visão):** Frontend desenvolvido em **Vue 3** com **Vite** e **TypeScript**. O frontend consome a API do PostgREST utilizando o cliente `@supabase/postgrest-js` de forma 100% tipada, gerando as interfaces de usuário a partir do arquivo `schema.ts` gerado pelo contrato OpenAPI.
    

## 2. Requisitos Funcionais e Perfis de Acesso

O sistema gerencia três perfis de usuários com escopos e permissões bem definidos:

### A. Aluno (Comunidade Externa / Solicitante)

- **Abertura de Chamado:** Permite preencher um formulário de solicitação de monitoria informando: Nome Completo, Data de Nascimento, E-mail, Telefone, CPF (obrigatório para fins de certificação), descrição da dúvida e dias/horários em que possui tempo livre.
    
- **Escolha de Formato:** Opção de selecionar monitoria Presencial (com alocação física na sala 918S ou laboratórios do campus) ou Online.
    
- **Visualização de Contato Seguro:** Caso o agendamento seja confirmado pela gestão, o aluno tem acesso à informação de contato do monitor responsável. Dependendo da configuração de privacidade adotada pelo monitor, o sistema exibirá o número de WhatsApp ou apenas o nome de perfil da plataforma de comunicação.
    

### B. Monitor (Voluntário ou Bolsista)

- **Grade de Disponibilidade Individual:** Uma interface visual em matriz (Dias da Semana x Blocos de Horário) onde o monitor preenche sua disponibilidade para atendimentos e para as reuniões gerais de alinhamento com pesos definidos: `1.0` para Presencial, `0.5` para Online e `0.0` para Indisponível.
    
- **Configurações de Privacidade:** Permite ativar ou desativar a exibição de suas informações de contato para os alunos vinculados às suas monitorias confirmadas.
    
- **Registro de Horas Semanal Unificado:** Uma tela em fluxo contínuo onde o monitor informa a semana de referência e adiciona todas as atividades executadas no período (Monitoria, Marketing Digital, Desenvolvimento de Software/Site, ou Criação de Minicurso). O monitor realiza o upload obrigatório do Relatório de Atividades (Modelo Proex) em PDF e o link ou arquivo de evidência de execução (commits no GitHub, posts de redes sociais, ou atas de presença).
    

### C. Equipe de Execução e Coordenação (Gestão / Administrador)

- **Fila de Auditoria de Horas:** Tela consolidada para realizar a varredura e análise dos relatórios submetidos. Exibe os arquivos e links lado a lado para validação ou recusa das horas em lote.
    
- **Mapa de Calor da Reunião Geral:** Uma tela que consome uma View agregada do banco de dados, somando todas as planilhas de disponibilidade individual dos membros para exibir ao coordenador as melhores janelas de horários para agendar as reuniões semanais de alinhamento.
    
- **Módulo de Exportação SRC:** Painel para extrair relatórios formatados em lote contendo os dados dos voluntários e alunos atendidos para cadastro e homologação rápida no sistema SRC do Ifes.
    

## 3. Regras de Negócio Críticas (Automatizadas no Banco)

O sistema deve processar nativamente as regras contidas no manual de certificação do LAMPEX:

1. **Trava de Reuniões Semanais:** As reuniões de planejamento não devem ser contabilizadas automaticamente como horas brutas de certificação líquida, exceto se marcadas manualmente pela gestão como casos específicos de complementação de horas de projetos finalizados.
    
2. **Cálculo Automatizado de Pesos (Multiplicadores):** Ao salvar um registro de atividade, o modelo calcula automaticamente a carga líquida com base nas regras:
    
    - **Monitorias:** Horas de atendimento praticadas $\times$ 2 (computando o tempo de atendimento mais uma hora equivalente para planejamento do monitor).
        
    - **Minicurso com Material:** Horas de aula $\times$ 3 (Apostilas, tutoriais, exercícios).
        
    - **Minicurso sem Material:** Horas de videoaula gravada $\times$ 2,5.
        
    - **Marketing Digital:** 2 horas fixas por Story, Reel ou publicação no Feed com legenda; e 4 horas fixas para estruturação/melhoria de perfil.
        
    - **Desenvolvimento de Software / Outros:** Carga horária líquida parametrizável definida a combinar com a gestão.
        

Se precisar que eu detalhe o formato JSON esperado para algum endpoint específico da especificação OpenAPI para passar para o Agy, é só pedir.