# API and Integration Quality Checklist: LampexControl

**Purpose**: Auto-avaliação da qualidade dos requisitos de API PostgREST e integração SRC
**Created**: 2026-07-06
**Feature**: [spec.md](file:///C:/Users/josue/OneDrive/Documentos/Jramso/Node/Ts/LampexControl/lampex-control/specs/001-lampex-control-system/spec.md)

## Completeness of API Schemas

- [ ] CHK001 - Estão definidos na especificação os esquemas exatos de requisição e resposta para as funções RPC de `/rpc/login` e `/rpc/submit_weekly_report`? [Completeness, Spec §FR-011, §FR-004]
- [ ] CHK002 - A especificação define a estrutura exata do payload de submissão em lote (array JSON) para múltiplos itens de atividade? [Completeness, Spec §FR-004]
- [ ] CHK003 - São especificados os campos obrigatórios e formatos de dados esperados para o histórico de auditoria? [Completeness, Spec §FR-012]

## Clarity of Integration Formats

- [ ] CHK004 - O formato de arquivo final (ex: CSV ou XLSX) para a exportação de dados do sistema SRC do Ifes está explicitamente definido? [Completeness, Spec §FR-009]
- [ ] CHK005 - Estão definidos os campos de mapeamento obrigatórios que devem constar no relatório gerado para o SRC? [Completeness, Spec §FR-009]

## Security & Rate Limiting Requirements

- [ ] CHK006 - Os limites de taxa (Rate Limiting) de 60 req/min e 5 req/min estão quantificados com os comportamentos esperados de bloqueio (ex: HTTP 429)? [Clarity, Spec §FR-013]
- [ ] CHK007 - As permissões de acesso do PostgREST estão alinhadas de forma consistente com as roles especificadas (monitor, gestor)? [Consistency, Spec §FR-011]
- [ ] CHK008 - O comportamento do sistema para tokens JWT expirados ou malformados está especificado nos requisitos de acesso? [Coverage, Spec §FR-011]

## Exception Flow & Resilience Coverage

- [ ] CHK009 - O sistema define requisitos de contingência caso o serviço de armazenamento externo de arquivos falhe durante o upload do PDF? [Gap, Spec §FR-004]
- [ ] CHK010 - Está definido o fluxo de erro caso o monitor envie uma URL de evidência inválida ou inacessível? [Coverage, Spec §FR-004]

## Terminology & Consistency

- [ ] CHK011 - O fuso horário de referência para a agregação do mapa de calor está especificado para evitar conflitos de exibição? [Ambiguity, Spec §FR-008]
- [ ] CHK012 - Os status de auditoria ('Aprovado', 'Recusado') são utilizados de forma consistente entre o histórico e as transições de estado do registro? [Consistency, Spec §FR-012]
