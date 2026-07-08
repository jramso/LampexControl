<script setup lang="ts">
import { ref } from 'vue';
import { apiClient } from '../services/apiClient';
import { getMonitorContact } from '../services/apiService';

const searchCpf = ref('');
const ticket = ref<any>(null);
const monitorInfo = ref<any>(null);
const searchDone = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const handleSearch = async () => {
  errorMessage.value = '';
  ticket.value = null;
  monitorInfo.value = null;
  searchDone.value = false;

  const cleanCpf = searchCpf.value.replace(/\D/g, '');
  if (cleanCpf.length !== 11) {
    errorMessage.value = 'Por favor, insira um CPF válido com 11 dígitos.';
    return;
  }

  isLoading.value = true;
  
  try {
    const { data, error } = await apiClient
      .from('solicitacao_monitoria')
      .select('*')
      .eq('cpf_aluno', cleanCpf)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      errorMessage.value = `Erro na busca: ${error.message}`;
    } else if (data && data.length > 0) {
      ticket.value = data[0];
      
      // Buscar dados de contato do monitor se estiver confirmado usando a view mapeada
      if (ticket.value.status === 'Confirmado' && ticket.value.monitor_responsavel_id) {
        const contact = await getMonitorContact(cleanCpf);
        if (contact) {
          monitorInfo.value = {
            nome: contact.monitor_nome,
            permite_exibir_contato: !!contact.monitor_telefone,
            plataforma_contato: contact.monitor_plataforma,
            telefone: contact.monitor_telefone
          };
        }
      }
      searchDone.value = true;
    } else {
      searchDone.value = true;
    }
  } catch (err: any) {
    errorMessage.value = 'Erro ao conectar ao servidor.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div style="max-width: 700px; margin: 0 auto;">
    <h1 style="text-align: center; margin-bottom: 2rem; color: var(--color-primary);">
      Consultar Status de Monitoria
    </h1>

    <div class="glass-card" style="margin-bottom: 2rem;">
      <form @submit.prevent="handleSearch" class="search-form" style="display: flex; gap: 1rem; align-items: flex-end;">
        <div class="form-group" style="flex: 1; margin-bottom: 0;">
          <label class="form-label">Insira seu CPF (Apenas números)</label>
          <input v-model="searchCpf" type="text" class="form-input" placeholder="Ex: 12345678901" maxlength="11" required />
        </div>
        <button type="submit" class="btn-primary" style="height: 46px;" :disabled="isLoading">
          {{ isLoading ? 'Buscando...' : 'Buscar' }}
        </button>
      </form>
      
      <p v-if="errorMessage" style="color: var(--accent-red); margin-top: 1rem; font-weight: 500;">
        ⚠️ {{ errorMessage }}
      </p>
    </div>

    <!-- Resultados da Busca -->
    <div v-if="searchDone" class="glass-card">
      <div v-if="ticket">
        <div class="protocol-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <div>
            <h3 style="color: var(--text-primary);">Protocolo de Atendimento</h3>
            <span style="font-size: 0.85rem; color: var(--text-secondary);">Código: {{ ticket.id.substring(0, 8).toUpperCase() }}</span>
          </div>
          <span 
            class="badge" 
            :style="{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: '600',
              fontSize: '0.9rem',
              backgroundColor: ticket.status === 'Confirmado' ? 'rgba(16, 185, 129, 0.2)' : ticket.status === 'Cancelado' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: ticket.status === 'Confirmado' ? 'var(--accent-green)' : ticket.status === 'Cancelado' ? 'var(--accent-red)' : 'var(--accent-amber)',
              border: `1px solid ${ticket.status === 'Confirmado' ? 'var(--accent-green)' : ticket.status === 'Cancelado' ? 'var(--accent-red)' : 'var(--accent-amber)'}`
            }"
          >
            {{ ticket.status }}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <div>
            <h4 style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">Nome do Aluno</h4>
            <p style="color: var(--text-primary); font-weight: 500;">{{ ticket.nome_aluno }}</p>
          </div>
          <div>
            <h4 style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">Formato de Preferência</h4>
            <p style="color: var(--text-primary); font-weight: 500;">{{ ticket.formato }}</p>
          </div>
          <div>
            <h4 style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">Horário Solicitado</h4>
            <p style="color: var(--text-primary); font-weight: 500;">{{ ticket.horarios_disponiveis.dia }} - {{ ticket.horarios_disponiveis.bloco }}</p>
          </div>
          <div>
            <h4 style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">Data da Solicitação</h4>
            <p style="color: var(--text-primary); font-weight: 500;">{{ new Date(ticket.created_at).toLocaleDateString() }}</p>
          </div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h4 style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">Descrição da Dúvida</h4>
          <p style="color: var(--text-primary); background-color: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            {{ ticket.descricao_duvida }}
          </p>
        </div>

        <!-- Dados do Monitor Responsável e Privacidade Condicional -->
        <div v-if="ticket.status === 'Confirmado'" style="border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
          <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Dados de Atendimento</h3>
          
          <div v-if="monitorInfo" class="glass-card" style="background-color: rgba(0, 135, 68, 0.03); border-color: rgba(0, 135, 68, 0.2);">
            <div class="monitor-contact-row" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 0.8rem; color: var(--color-primary); font-weight: 600; text-transform: uppercase;">Monitor Responsável</span>
                <h4 style="color: var(--text-primary); font-size: 1.2rem; margin-top: 0.25rem;">{{ monitorInfo.nome }}</h4>
              </div>
              
              <!-- Exibição de contato condicional baseada na LGPD/Privacidade -->
              <div>
                <template v-if="monitorInfo.permite_exibir_contato">
                  <span style="font-size: 0.8rem; color: var(--text-secondary); display: block; text-align: right;">Meio de Contato ({{ monitorInfo.plataforma_contato }})</span>
                  <a 
                    v-if="monitorInfo.plataforma_contato === 'WhatsApp'"
                    :href="`https://wa.me/55${monitorInfo.telefone.replace(/\D/g, '')}`" 
                    target="_blank"
                    class="btn-primary" 
                    style="padding: 0.5rem 1rem; font-size: 0.9rem; margin-top: 0.25rem; background: var(--accent-green);"
                  >
                    Abrir WhatsApp
                  </a>
                  <span v-else style="color: var(--text-primary); font-weight: 600; font-size: 1.1rem;">
                    {{ monitorInfo.telefone }}
                  </span>
                </template>
                <span v-else style="color: var(--text-muted); font-style: italic; font-size: 0.9rem;">
                  Opção de contato privado ativada pelo monitor.
                </span>
              </div>
            </div>
          </div>
          <div v-else style="color: var(--text-muted); font-style: italic;">
            Carregando informações do monitor...
          </div>
        </div>
      </div>
      
      <div v-else style="text-align: center; padding: 2rem 0;">
        <h3 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Nenhuma solicitação encontrada</h3>
        <p style="color: var(--text-muted);">Verifique se digitou o CPF corretamente ou envie uma nova solicitação.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-form {
  flex-wrap: wrap;
}
.protocol-header, .monitor-contact-row {
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .search-form {
    flex-direction: column;
    align-items: stretch !important;
    gap: 0.75rem !important;
  }
  .search-form button {
    width: 100%;
    height: 44px !important;
  }
  .protocol-header, .monitor-contact-row {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.75rem !important;
  }
  .monitor-contact-row div:last-child {
    width: 100%;
    text-align: left !important;
  }
  .monitor-contact-row a {
    width: 100%;
    justify-content: center;
  }
}
</style>
