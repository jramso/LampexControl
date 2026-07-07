<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { submitWeeklyReport } from '../services/apiService';
import WeeklyReportForm from '../components/WeeklyReportForm.vue';

const router = useRouter();
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const handleSubmitReport = async (payload: {
  semana_ref: string;
  pdf_url: string;
  atividades: Array<{
    tipo_atividade: string;
    horas_brutas: number;
    evidencia_url: string;
  }>;
}) => {
  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // Chamar a RPC registro_horas através do serviço abstrato
    await submitWeeklyReport({
      semana_ref: payload.semana_ref,
      pdf_url: payload.pdf_url,
      atividades: payload.atividades
    });

    successMessage.value = 'Registro semanal de atividades enviado com sucesso!';
    setTimeout(() => {
      router.push({ name: 'MonitorProfile' });
    }, 1500);
  } catch (err: any) {
    if (err.message && err.message.includes('rate_limit_exceeded')) {
      errorMessage.value = 'Limite de requisições excedido. Tente novamente mais tarde.';
    } else if (err.message && err.message.includes('unique_semana_monitor')) {
      errorMessage.value = 'Você já enviou um registro para esta semana. Edite a submissão existente ou fale com a gestão.';
    } else {
      errorMessage.value = `Erro ao submeter: ${err.message || err}`;
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div style="max-width: 800px; margin: 0 auto;">
    <h1 style="margin-bottom: 2rem; color: var(--color-primary);">
      Submeter Relatório Semanal
    </h1>

    <div v-if="errorMessage" class="glass-card" style="border-color: var(--accent-red); margin-bottom: 1.5rem; padding: 1rem; color: var(--accent-red); font-weight: 500;">
      ⚠️ {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="glass-card" style="border-color: var(--accent-green); margin-bottom: 1.5rem; padding: 1rem; color: var(--accent-green); font-weight: 500;">
      ✓ {{ successMessage }}
    </div>

    <div v-if="isSubmitting" style="text-align: center; padding: 2rem;">
      <p style="color: var(--text-secondary);">Enviando relatório em lote e calculando horas...</p>
    </div>

    <WeeklyReportForm v-else @submit="handleSubmitReport" />
  </div>
</template>
