<script setup lang="ts">
import { ref, computed } from 'vue';

const emit = defineEmits(['submit']);

const semanaRef = ref('');
const pdfUrl = ref('');
const atividades = ref<Array<{
  tipo_atividade: string;
  horas_brutas: number;
  evidencia_url: string;
}>>([]);

const tipoOpcoes = [
  'Monitoria',
  'Minicurso com Material',
  'Minicurso sem Material',
  'Marketing Digital',
  'Desenvolvimento',
  'Outros'
];

const addAtividade = () => {
  atividades.value.push({
    tipo_atividade: 'Monitoria',
    horas_brutas: 1.0,
    evidencia_url: ''
  });
};

const removeAtividade = (index: number) => {
  atividades.value.splice(index, 1);
};

// Cálculo de Horas Líquidas Estimadas no Frontend para melhor UX
const totalHorasBrutas = computed(() => {
  return atividades.value.reduce((sum, act) => sum + Number(act.horas_brutas || 0), 0);
});

const calculateLiquidas = (tipo: string, brutas: number, url: string) => {
  const h = Number(brutas || 0);
  // Trava de Reunião
  if (tipo === 'Outros' && url.toLowerCase().includes('planejamento')) {
    return 0;
  }
  
  switch (tipo) {
    case 'Monitoria':
      return h * 2.0;
    case 'Minicurso com Material':
      return h * 3.0;
    case 'Minicurso sem Material':
      return h * 2.5;
    case 'Marketing Digital':
      return h === 1.0 ? 2.0 : 4.0;
    default:
      return h;
  }
};

const totalHorasLiquidas = computed(() => {
  return atividades.value.reduce((sum, act) => {
    return sum + calculateLiquidas(act.tipo_atividade, act.horas_brutas, act.evidencia_url);
  }, 0);
});

const handleSubmit = () => {
  if (!semanaRef.value || !pdfUrl.value) {
    alert('Por favor, preencha a semana de referência e o link do PDF Proex.');
    return;
  }
  if (atividades.value.length === 0) {
    alert('Por favor, adicione pelo menos uma atividade.');
    return;
  }
  
  emit('submit', {
    semana_ref: semanaRef.value,
    pdf_url: pdfUrl.value,
    atividades: atividades.value
  });
};
</script>

<template>
  <div class="glass-card">
    <h2 style="margin-bottom: 1.5rem; color: #fff; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
      Submissão de Atividades Semanais
    </h2>

    <form @submit.prevent="handleSubmit">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
        <div class="form-group">
          <label class="form-label">Semana de Referência *</label>
          <input v-model="semanaRef" type="date" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Link do Relatório PDF (Proex) *</label>
          <input v-model="pdfUrl" type="url" class="form-input" placeholder="Ex: https://storage.com/relatorio.pdf" required />
        </div>
      </div>

      <div style="border-top: 1px solid var(--border-color); padding-top: 1.5rem; margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="color: #fff; font-size: 1.2rem;">Itens de Atividade</h3>
          <button type="button" @click="addAtividade" class="btn-primary" style="padding: 0.4rem 1rem; font-size: 0.85rem;">
            + Adicionar Atividade
          </button>
        </div>

        <div v-if="atividades.length === 0" style="text-align: center; padding: 2rem; background: var(--bg-secondary); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
          <p style="color: var(--text-muted);">Nenhuma atividade adicionada para esta semana. Adicione pelo menos uma.</p>
        </div>

        <!-- Lista Dinâmica de Atividades -->
        <div v-else style="display: flex; flex-direction: column; gap: 1rem;">
          <div 
            v-for="(act, index) in atividades" 
            :key="index" 
            class="glass-card" 
            style="padding: 1.25rem; background: rgba(31, 41, 55, 0.3); position: relative;"
          >
            <div style="display: grid; grid-template-columns: 2fr 1fr 3fr; gap: 1rem; align-items: flex-end;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Tipo de Atividade</label>
                <select v-model="act.tipo_atividade" class="form-select">
                  <option v-for="op in tipoOpcoes" :key="op" :value="op">{{ op }}</option>
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Horas Brutas</label>
                <input v-model.number="act.horas_brutas" type="number" step="0.5" min="0.5" class="form-input" required />
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Link de Evidência (GitHub, Ata, Post)</label>
                <input v-model="act.evidencia_url" type="url" class="form-input" placeholder="Ex: https://github.com/..." required />
              </div>
            </div>

            <!-- Resumo de cálculo estimativo da atividade -->
            <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
              <span style="color: var(--text-secondary);">
                Cálculo: <strong style="color: var(--accent-cyan);">
                  {{ calculateLiquidas(act.tipo_atividade, act.horas_brutas, act.evidencia_url).toFixed(1) }} horas líquidas
                </strong>
              </span>
              <button type="button" @click="removeAtividade(index)" style="color: var(--accent-red); background: transparent; border: none; cursor: pointer; font-weight: 500;">
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumo Totalizador da Semana -->
      <div 
        v-if="atividades.length > 0" 
        class="glass-card" 
        style="background: rgba(6, 182, 212, 0.02); border-color: rgba(6, 182, 212, 0.15); display: flex; justify-content: space-around; align-items: center; margin-bottom: 1.5rem; padding: 1rem;"
      >
        <div>
          <span style="font-size: 0.85rem; color: var(--text-secondary); display: block;">Total Brutas</span>
          <span style="font-size: 1.5rem; font-weight: 700; color: #fff;">{{ totalHorasBrutas.toFixed(1) }}h</span>
        </div>
        <div style="border-left: 1px solid var(--border-color); height: 40px;"></div>
        <div>
          <span style="font-size: 0.85rem; color: var(--accent-cyan); display: block; font-weight: 500;">Carga Líquida Estimada</span>
          <span style="font-size: 1.75rem; font-weight: 800; color: var(--accent-cyan);">{{ totalHorasLiquidas.toFixed(1) }}h</span>
        </div>
      </div>

      <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">
        Submeter Registro Semanal
      </button>
    </form>
  </div>
</template>
