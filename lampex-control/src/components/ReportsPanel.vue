<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getMonitorReports, getStudentReports } from '../services/apiService';

interface MonitorReportItem {
  acao_id: string;
  acao_nome: string;
  monitor_id: string;
  monitor_nome: string;
  horas_planejamento: string;
}

interface StudentReportItem {
  acao_id: string;
  acao_nome: string;
  matricula: string;
  nome: string;
  horas_consumidas: string;
}

const startDate = ref('');
const endDate = ref('');

const monitorReports = ref<MonitorReportItem[]>([]);
const studentReports = ref<StudentReportItem[]>([]);

const isLoading = ref(false);
const errorMessage = ref('');

// Set default date range to current month
const setDefaultDates = () => {
  const now = new Date();
  
  // First day of month
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const startYear = firstDay.getFullYear();
  const startMonth = String(firstDay.getMonth() + 1).padStart(2, '0');
  const startDay = '01';
  startDate.value = `${startYear}-${startMonth}-${startDay}`;

  // Last day of month
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const endYear = lastDay.getFullYear();
  const endMonth = String(lastDay.getMonth() + 1).padStart(2, '0');
  const endDay = String(lastDay.getDate()).padStart(2, '0');
  endDate.value = `${endYear}-${endMonth}-${endDay}`;
};

const fetchReports = async () => {
  if (!startDate.value || !endDate.value) {
    errorMessage.value = 'Por favor, selecione ambas as datas inicial e final.';
    return;
  }

  if (new Date(startDate.value) > new Date(endDate.value)) {
    errorMessage.value = 'A data inicial não pode ser maior que a data final.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const [monitorsData, studentsData] = await Promise.all([
      getMonitorReports(startDate.value, endDate.value),
      getStudentReports(startDate.value, endDate.value)
    ]);
    monitorReports.value = monitorsData;
    studentReports.value = studentsData;
  } catch (err: any) {
    errorMessage.value = err.message || 'Erro ao carregar os relatórios.';
  } finally {
    isLoading.value = false;
  }
};

// Group monitor productivity by Action of Extension
const monitorReportsByAcao = computed(() => {
  const groups: Record<string, { acao_nome: string; items: MonitorReportItem[] }> = {};
  for (const item of monitorReports.value) {
    const acaoId = item.acao_id || 'sem-acao';
    if (!groups[acaoId]) {
      groups[acaoId] = {
        acao_nome: item.acao_nome || 'Sem Ação de Extensão',
        items: []
      };
    }
    groups[acaoId].items.push(item);
  }
  return groups;
});

// Group student consumption by Action of Extension
const studentReportsByAcao = computed(() => {
  const groups: Record<string, { acao_nome: string; items: StudentReportItem[] }> = {};
  for (const item of studentReports.value) {
    const acaoId = item.acao_id || 'sem-acao';
    if (!groups[acaoId]) {
      groups[acaoId] = {
        acao_nome: item.acao_nome || 'Sem Ação de Extensão',
        items: []
      };
    }
    groups[acaoId].items.push(item);
  }
  return groups;
});

onMounted(() => {
  setDefaultDates();
  fetchReports();
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 2rem;">
    <!-- Filtros de Data -->
    <div class="glass-card" style="padding: 1.5rem; display: flex; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem; min-width: 200px; flex: 1;">
        <label class="form-label" style="margin: 0;">Data Inicial</label>
        <input v-model="startDate" type="date" class="form-input" />
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.5rem; min-width: 200px; flex: 1;">
        <label class="form-label" style="margin: 0;">Data Final</label>
        <input v-model="endDate" type="date" class="form-input" />
      </div>

      <button 
        @click="fetchReports" 
        class="btn-primary" 
        style="height: 42px; background-color: #008744; border-color: #008744; min-width: 120px; justify-content: center;"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Filtrando...' : 'Filtrar' }}
      </button>
    </div>

    <!-- Error state -->
    <div v-if="errorMessage" style="color: var(--accent-red); font-weight: 500; padding: 1rem; border: 1px solid var(--accent-red); border-radius: 8px; background-color: rgba(214, 45, 32, 0.05);">
      ⚠️ {{ errorMessage }}
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" style="text-align: center; padding: 3rem 0; color: var(--text-secondary); font-weight: 500;">
      Carregando relatórios do período...
    </div>

    <!-- Tabelas de Relatório -->
    <div v-else class="responsive-grid-2" style="gap: 2rem; align-items: start;">
      
      <!-- Tabela 1: Produtividade Monitores -->
      <div class="glass-card" style="padding: 1.5rem;">
        <h3 style="color: #008744; margin-bottom: 1rem; border-bottom: 2px solid #008744; padding-bottom: 0.5rem; font-size: 1.25rem;">
          Produtividade dos Monitores (Fator x2)
        </h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.5rem;">
          Horas de atendimento computadas com o fator de planejamento de 2.0x.
        </p>

        <div v-if="monitorReports.length === 0" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          Nenhum registro encontrado neste período.
        </div>

        <div v-else v-for="(group, acaoId) in monitorReportsByAcao" :key="acaoId" style="margin-bottom: 2rem;">
          <h4 style="color: var(--text-primary); font-size: 1rem; margin-bottom: 0.75rem; font-weight: 600; border-left: 3px solid #008744; padding-left: 0.5rem;">
            {{ group.acao_nome }}
          </h4>
          <div style="overflow-x: auto;">
            <table class="report-table">
              <thead>
                <tr>
                  <th style="background-color: #008744; color: white; text-align: left; padding: 0.75rem;">Monitor</th>
                  <th style="background-color: #008744; color: white; text-align: right; padding: 0.75rem; width: 140px;">Horas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in group.items" :key="item.monitor_id" class="table-row">
                  <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color); font-weight: 500;">
                    {{ item.monitor_nome }}
                  </td>
                  <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color); text-align: right; font-weight: 600; color: #008744;">
                    {{ item.horas_planejamento }}h
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tabela 2: Consumo de Alunos -->
      <div class="glass-card" style="padding: 1.5rem;">
        <h3 style="color: #008744; margin-bottom: 1rem; border-bottom: 2px solid #008744; padding-bottom: 0.5rem; font-size: 1.25rem;">
          Consumo de Horas (Alunos Atendidos)
        </h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.5rem;">
          Horas reais de monitoria consumidas pela comunidade acadêmica.
        </p>

        <div v-if="studentReports.length === 0" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          Nenhum registro encontrado neste período.
        </div>

        <div v-else v-for="(group, acaoId) in studentReportsByAcao" :key="acaoId" style="margin-bottom: 2rem;">
          <h4 style="color: var(--text-primary); font-size: 1rem; margin-bottom: 0.75rem; font-weight: 600; border-left: 3px solid #008744; padding-left: 0.5rem;">
            {{ group.acao_nome }}
          </h4>
          <div style="overflow-x: auto;">
            <table class="report-table">
              <thead>
                <tr>
                  <th style="background-color: #008744; color: white; text-align: left; padding: 0.75rem; width: 120px;">Matrícula</th>
                  <th style="background-color: #008744; color: white; text-align: left; padding: 0.75rem;">Nome do Aluno</th>
                  <th style="background-color: #008744; color: white; text-align: right; padding: 0.75rem; width: 100px;">Horas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in group.items" :key="item.matricula" class="table-row">
                  <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color); font-family: monospace; color: var(--text-secondary);">
                    {{ item.matricula }}
                  </td>
                  <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color); font-weight: 500;">
                    {{ item.nome }}
                  </td>
                  <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color); text-align: right; font-weight: 600; color: var(--color-primary);">
                    {{ item.horas_consumidas }}h
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.report-table {
  width: 100%;
  border-collapse: collapse;
}

.table-row:hover {
  background-color: rgba(0, 135, 68, 0.03);
}

.table-row td {
  transition: background-color 0.15s ease;
}
</style>
