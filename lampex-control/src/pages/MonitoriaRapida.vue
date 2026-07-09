<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getActiveMonitors, registerAttendance } from '../services/apiService';

const route = useRoute();

interface Monitor {
  id: string;
  nome: string;
  matricula?: string;
}

const monitors = ref<Monitor[]>([]);
const selectedMonitorId = ref('');
const matricula = ref('');
const nome = ref('');
const modalidade = ref<'Presencial' | 'Online' | 'Presencial com Professor'>('Presencial');
const localOuLink = ref('Laboratório 205');
const horasDuracao = ref<number | ''>('');
const codigoMonitor = ref('');
const senhaAula = ref('');

const isLoadingMonitors = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Pre-select monitor from query params if available
const checkQueryParamMonitor = () => {
  const queryMonitorId = route.query.monitor_id as string;
  if (queryMonitorId && monitors.value.some(m => m.id === queryMonitorId)) {
    selectedMonitorId.value = queryMonitorId;
  }
};

onMounted(async () => {
  isLoadingMonitors.value = true;
  errorMessage.value = '';
  try {
    monitors.value = await getActiveMonitors();
    checkQueryParamMonitor();
  } catch (err: any) {
    errorMessage.value = 'Não foi possível carregar a lista de monitores. Tente novamente mais tarde.';
  } finally {
    isLoadingMonitors.value = false;
  }
});

// Watch query params to update pre-selected monitor
watch(() => route.query.monitor_id, () => {
  checkQueryParamMonitor();
});

watch(modalidade, (newVal) => {
  if (newVal === 'Online') {
    localOuLink.value = 'Online';
  } else {
    if (localOuLink.value === 'Online' || localOuLink.value === '') {
      localOuLink.value = 'Laboratório 205';
    }
  }
  if (newVal !== 'Presencial com Professor') {
    senhaAula.value = '';
  }
});

const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!selectedMonitorId.value || !matricula.value || !nome.value || !modalidade.value || !localOuLink.value || horasDuracao.value === '' || !codigoMonitor.value) {
    errorMessage.value = 'Por favor, preencha todos os campos obrigatórios.';
    return;
  }

  if (modalidade.value === 'Presencial com Professor' && !senhaAula.value) {
    errorMessage.value = 'Por favor, insira a senha de aula fornecida pelo professor.';
    return;
  }

  const cleanMatricula = matricula.value.trim().toUpperCase();
  if (!cleanMatricula || !/^[A-Z0-9]+$/.test(cleanMatricula)) {
    errorMessage.value = 'Matrícula inválida. Insira apenas letras e números.';
    return;
  }

  const hours = Number(horasDuracao.value);
  if (isNaN(hours) || hours <= 0) {
    errorMessage.value = 'A duração em horas deve ser um número maior que zero.';
    return;
  }

  isSubmitting.value = true;

  try {
    await registerAttendance({
      monitor_id: selectedMonitorId.value,
      matricula: cleanMatricula,
      nome: nome.value,
      modalidade: modalidade.value,
      local_ou_link: localOuLink.value,
      horas_duracao: hours,
      codigo_monitor: codigoMonitor.value.trim(),
      senha_aula: modalidade.value === 'Presencial com Professor' ? senhaAula.value.trim() : undefined
    });

    successMessage.value = 'Atendimento registrado com sucesso! Obrigado pela confirmação.';
    
    // Limpar campos
    matricula.value = '';
    nome.value = '';
    localOuLink.value = modalidade.value === 'Online' ? 'Online' : 'Laboratório 205';
    horasDuracao.value = '';
    codigoMonitor.value = '';
    senhaAula.value = '';
  } catch (err: any) {
    errorMessage.value = err.message || 'Erro ao registrar atendimento. Tente novamente.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div style="padding: 0 1rem; width: 100%;">
    <div class="glass-card" style="max-width: 600px; margin: 2rem auto;">
      
      <h2 style="margin-bottom: 1.5rem; color: var(--color-primary); border-bottom: 2px solid var(--color-primary); padding-bottom: 0.75rem; font-size: 1.75rem;">
        Confirmação de Atendimento (QR Code)
      </h2>
      <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.95rem;">
        Preencha os campos abaixo para validar digitalmente a realização do seu atendimento.
      </p>

      <div v-if="isLoadingMonitors" style="text-align: center; padding: 2rem 0; color: var(--text-secondary);">
        Carregando lista de monitores...
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group responsive-grid-2" style="gap: 1rem;">
          <div>
            <label class="form-label">Monitor que realizou o atendimento *</label>
            <select v-model="selectedMonitorId" class="form-select" required>
              <option value="" disabled selected>Selecione o monitor</option>
              <option v-for="monitor in monitors" :key="monitor.id" :value="monitor.id">
                {{ monitor.nome }}
              </option>
            </select>
          </div>
          <div>
            <label class="form-label">Código de Segurança do Monitor *</label>
            <input v-model="codigoMonitor" type="text" class="form-input" placeholder="4 últimos dígitos da matrícula" maxlength="4" required />
          </div>
        </div>

        <div class="form-group responsive-grid-2" style="gap: 1rem;">
          <div>
            <label class="form-label">Sua Matrícula Ifes *</label>
            <input v-model="matricula" type="text" class="form-input" placeholder="Ex: 20261BSI0000" required />
          </div>
          <div>
            <label class="form-label">Seu Nome Completo *</label>
            <input v-model="nome" type="text" class="form-input" placeholder="Digite seu nome completo" required />
          </div>
        </div>

        <div class="form-group responsive-grid-2" style="gap: 1rem;">
          <div>
            <label class="form-label">Modalidade *</label>
            <select v-model="modalidade" class="form-select" required>
              <option value="Presencial">Presencial</option>
              <option value="Online">Online</option>
              <option value="Presencial com Professor">Presencial com Professor</option>
            </select>
          </div>
          <div>
            <label class="form-label">Duração do Atendimento (Horas) *</label>
            <input v-model="horasDuracao" type="number" step="0.25" min="0.25" class="form-input" placeholder="Ex: 1.5" required />
          </div>
        </div>

        <div v-if="modalidade === 'Presencial' || modalidade === 'Presencial com Professor'" class="form-group">
          <label class="form-label">Local Físico do Atendimento *</label>
          <input 
            v-model="localOuLink" 
            type="text" 
            class="form-input" 
            placeholder="Ex: Laboratório 205, Sala 103" 
            required 
          />
        </div>

        <div v-if="modalidade === 'Presencial com Professor'" class="form-group">
          <label class="form-label">Senha de Aula (Fornecida pelo Professor) *</label>
          <input 
            v-model="senhaAula" 
            type="password" 
            class="form-input" 
            placeholder="Digite a senha de aula" 
            required 
          />
        </div>

        <div v-if="errorMessage" style="color: var(--accent-red); margin-bottom: 1.5rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
          ⚠️ {{ errorMessage }}
        </div>

        <div v-if="successMessage" style="color: var(--accent-green); margin-bottom: 1.5rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
          ✓ {{ successMessage }}
        </div>

        <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.85rem;" :disabled="isSubmitting">
          {{ isSubmitting ? 'Registrando...' : 'Registrar Atendimento' }}
        </button>
      </form>
    </div>
  </div>
</template>
