# UI Data Model: Responsividade e Adequação Mobile

Como esta funcionalidade foca na refatoração da camada de apresentação (View) do LampexControl, nenhuma entidade de banco de dados ou tabela nova foi introduzida. A seguir estão mapeados os modelos de dados e estados lógicos da interface (client-side) necessários para suportar os comportamentos responsivos.

## 1. Estados Lógicos de Interface (Client-Side States)

### NavbarState
Estado reativo local responsável por rastrear a visibilidade do menu de navegação vertical expandido no mobile.

* **Propriedades**:
  * `isMenuOpen` (`boolean`):
    * `true`: Menu móvel vertical visível (sobreposto ou empurrado).
    * `false`: Menu móvel vertical ocultado (comportamento padrão).
* **Transições de Estado**:
  * `toggleMenu()`: Inverte o valor de `isMenuOpen`.
  * `closeMenu()`: Força `isMenuOpen` para `false` (acionado ao clicar em um link ou fora do menu).
  * `handleResize()`: Força `isMenuOpen` para `false` se a largura da tela ultrapassar 768px.

### AuditLayoutState
Estado reativo local para controle de visualização de relatórios de auditoria no mobile.

* **Propriedades**:
  * `isMobileLayout` (`boolean`):
    * `true`: Viewport inferior a 768px (iframe ocultado, exibe botão para aba externa).
    * `false`: Viewport igual ou maior que 768px (exibe iframe de visualização inline).
* **Transições de Estado**:
  * Acionado automaticamente através do monitoramento de media-queries no CSS ou verificação da largura da tela (`window.innerWidth < 768`).

---

## 2. Estrutura de Exibição dos Dados do Voluntário (Mobile Cards)

Para substituir a tabela horizontal no `TriagemPanel.vue` em telas móveis, mapeamos os dados do candidato (voluntário) oriundos da base de dados nas seguintes propriedades visuais no cartão móvel:

| Campo do Modelo | Tipo de Dado | Origem (Tabela `voluntario`) | Exibição no Cartão Mobile |
|-----------------|--------------|------------------------------|---------------------------|
| `nome`          | `string`     | `voluntario.nome`            | Título principal do card (negrito, destaque). |
| `email`         | `string`     | `voluntario.email`           | Detalhe de contato secundário com ícone/texto. |
| `telefone`      | `string`     | `voluntario.telefone`        | Detalhe de contato secundário com link direto para WhatsApp. |
| `matricula`     | `string`     | `voluntario.matricula`       | Badge informativa de identificação acadêmica. |
| `curso`         | `string`     | `voluntario.curso`           | Texto auxiliar no corpo do cartão. |
| `origem`        | `string`     | `voluntario.origem_cadastro` | Badge de origem do cadastro. |
| `data`          | `string`     | `voluntario.created_at`      | Data de inscrição formatada localmente. |
