<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '../services/apiClient';
import AvailabilityMatrix from '../components/AvailabilityMatrix.vue';

const nome = ref('');
const email = ref('');
const telefone = ref('');
const permiteExibir = ref(false);
const plataforma = ref('WhatsApp');
const matriz = ref<Record<string, Record<string, number>>>({});

const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const fetchProfile = async () => {
  const monitorId = localStorage.getItem('lampex_user_id');
  if (!monitorId) {
    errorMessage.value = 'Usuário não autenticado.';
    isLoading.value = false;
    return;
  }

  try {
    const { data, error } = await apiClient
      .from('monitor')
      .select('*')
      .eq('id', monitorId)
      .single();

    if (error) {
      errorMessage.value = `Erro ao carregar perfil: ${error.message}`;
    } else if (data) {
      nome.value = data.nome;
      email.value = data.email;
      telefone.value = data.telefone;
      permiteExibir.value = data.permite_exibir_contato;
      plataforma.value = data.plataforma_contato || 'WhatsApp';
      matriz.value = (data.matriz_disponibilidade as Record<string, Record<string, number>>) || {};
    }
  } catch (err: any) {
    errorMessage.value = 'Falha de conexão com o banco de dados.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchProfile);

const handleSave = async () => {
  const monitorId = localStorage.getItem('lampex_user_id');
  if (!monitorId) return;

  isSaving.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const { error } = await apiClient
      .from('monitor')
      .update({
        nome: nome.value,
        telefone: telefone.value,
        permite_exibir_contato: permiteExibir.value,
        plataforma_contato: plataforma.value,
        matriz_disponibilidade: matriz.value
      })
      .eq('id', monitorId);

    if (error) {
      errorMessage.value = `Erro ao salvar: ${error.message}`;
    } else {
      successMessage.value = 'Configurações de perfil e disponibilidade salvas com sucesso!';
      localStorage.setItem('lampex_user_name', nome.value);
      // Notifica o App.vue para atualizar o nome exibido
      window.dispatchEvent(new Event('auth-change'));
    }
  } catch (err: any) {
    errorMessage.value = 'Erro de conexão.';
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div style="max-width: 900px; margin: 0 auto;">
    <h1 style="margin-bottom: 2rem; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
      Configuração do Perfil & Disponibilidade
    </h1>

    <div v-if="isLoading" style="text-align: center; padding: 3rem;">
      <p style="color: var(--text-secondary);">Carregando dados do perfil...</p>
    </div>

    <div v-else-if="errorMessage && !nome" class="glass-card" style="border-color: var(--accent-red);">
      <p style="color: var(--accent-red);">⚠️ {{ errorMessage }}</p>
    </div>

    <form v-else @submit.prevent="handleSave" style="display: flex; flex-direction: column; gap: 2rem;">
      <!-- Informações Gerais & Privacidade -->
      <div class="glass-card" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <h3 style="grid-column: span 2; color: #fff; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
          Dados Cadastrais
        </h3>
        
        <div class="form-group">
          <label class="form-label">Nome Completo</label>
          <input v-model="nome" type="text" class="form-input" required />
        </div>
        
        <div class="form-group">
          <label class="form-label">E-mail (Login - Não alterável)</label>
          <input v-model="email" type="email" class="form-input" disabled />
        </div>

        <div class="form-group">
          <label class="form-label">Telefone de Contato</label>
          <input v-model="telefone" type="text" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Plataforma de Comunicação</label>
          <select v-model="plataforma" class="form-select">
            <option value="WhatsApp">WhatsApp</option>
            <option value="Discord">Discord</option>
            <option value="Telegram">Telegram</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <!-- Privacidade de Contato Condicional LGPD (FR-003) -->
        <div class="form-group" style="grid-column: span 2; display: flex; align-items: center; gap: 1rem; background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
          <input v-model="permiteExibir" type="checkbox" id="privacidade" style="width: 20px; height: 20px; cursor: pointer;" />
          <label for="privacidade" style="cursor: pointer;">
            <strong style="color: #fff; display: block; font-size: 0.95rem;">Exibir dados de contato para alunos confirmados</strong>
            <span style="color: var(--text-secondary); font-size: 0.85rem; display: block;">
              Se ativo, alunos com solicitações de monitoria confirmadas associadas a você poderão visualizar seu link de WhatsApp/plataforma.
            </span>
          </label>
        </div>
      </div>

      <!-- Matriz de Disponibilidade Semanal (FR-002) -->
      <div class="glass-card">
        <h3 style="color: #fff; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
          Grade de Disponibilidade Individual
        </h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
          Selecione seu formato disponível para atendimento em cada período da semana (Presencial possui peso 1.0, Online possui peso 0.5 e Indisponível possui peso 0.0).
        </p>
        
        <AvailabilityMatrix v-model="matriz" />
      </div>

      <!-- Alertas & Salvar -->
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div v-if="errorMessage" style="color: var(--accent-red); font-weight: 500;">
          ⚠️ {{ errorMessage }}
        </div>
        <div v-if="successMessage" style="color: var(--accent-green); font-weight: 500;">
          ✓ {{ successMessage }}
        </div>

        <button type="submit" class="btn-primary" style="align-self: flex-end; padding: 1rem 3rem;" :disabled="isSaving">
          {{ isSaving ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
      </div>
    </form>
  </div>
</template>
