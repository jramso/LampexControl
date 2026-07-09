<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AuditPanel from '../components/AuditPanel.vue';
import MeetingHeatmap from '../components/MeetingHeatmap.vue';
import TriagemPanel from '../components/TriagemPanel.vue';
import ReportsPanel from '../components/ReportsPanel.vue';
import { exportToSRC } from '../services/srcExport';
import { apiClient } from '../services/apiClient';
import { updateMonitorRole } from '../services/apiService';

const activeTab = ref<'audit' | 'heatmap' | 'triagem' | 'relatorios' | 'gestores'>('audit');

const currentUserRole = ref(localStorage.getItem('lampex_user_role') || '');
const isGestorFixo = computed(() => currentUserRole.value === 'gestor_fixo');

// State for gestores temporarios
const tempGestores = ref<any[]>([]);
const isLoadingGestores = ref(false);
const gestoresError = ref('');
const gestoresSuccess = ref('');

const fetchTempGestores = async () => {
  isLoadingGestores.value = true;
  gestoresError.value = '';
  try {
    const { data, error } = await apiClient
      .from('usuario')
      .select('id, nome, email, role')
      .in('role', ['voluntario', 'gestor_temporario'])
      .order('nome', { ascending: true });

    if (error) throw error;
    tempGestores.value = data || [];
  } catch (err: any) {
    gestoresError.value = 'Erro ao carregar gestores: ' + err.message;
  } finally {
    isLoadingGestores.value = false;
  }
};

const toggleRole = async (monitor: any) => {
  gestoresError.value = '';
  gestoresSuccess.value = '';
  const newRole = monitor.role === 'gestor_temporario' ? 'voluntario' : 'gestor_temporario';
  try {
    await updateMonitorRole(monitor.id, newRole);
    gestoresSuccess.value = `Cargo de ${monitor.nome} atualizado para ${newRole === 'gestor_temporario' ? 'Gestor Temporário' : 'Voluntário'} com sucesso!`;
    await fetchTempGestores();
  } catch (err: any) {
    gestoresError.value = err.message || 'Erro ao atualizar cargo do gestor.';
  }
};

const handleExport = async () => {
  await exportToSRC();
};

onMounted(() => {
  if (isGestorFixo.value) {
    fetchTempGestores();
  }
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 2rem;">
    <!-- Cabeçalho do Dashboard -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
      <div style="flex: 1; min-width: 280px;">
        <h1 class="dashboard-title" style="color: var(--color-primary); font-size: 2.25rem;">
          Painel de Gestão e Coordenação
        </h1>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">
          Auditoria de horas em lote, visualização de disponibilidade geral e exportação institucional para o SRC.
        </p>
      </div>

      <button @click="handleExport" class="btn-primary">
        📥 Exportar para o SRC
      </button>
    </div>

    <!-- Navegação de Abas do Dashboard -->
    <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch;">
      <button 
        @click="activeTab = 'audit'"
        class="tab-btn" 
        :class="{ active: activeTab === 'audit' }"
      >
        📑 Fila de Auditoria
      </button>
      <button 
        @click="activeTab = 'heatmap'"
        class="tab-btn" 
        :class="{ active: activeTab === 'heatmap' }"
      >
        🔥 Mapa de Calor (Reuniões)
      </button>
      <button 
        @click="activeTab = 'triagem'"
        class="tab-btn" 
        :class="{ active: activeTab === 'triagem' }"
      >
        📋 Triagem de Voluntários
      </button>
      <button 
        @click="activeTab = 'relatorios'"
        class="tab-btn" 
        :class="{ active: activeTab === 'relatorios' }"
      >
        📊 Relatórios
      </button>
      <button 
        v-if="isGestorFixo"
        @click="activeTab = 'gestores'"
        class="tab-btn" 
        :class="{ active: activeTab === 'gestores' }"
      >
        👥 Gestão de Cargos
      </button>
    </div>

    <!-- Conteúdo da Aba Ativa -->
    <div>
      <AuditPanel v-if="activeTab === 'audit'" />
      <MeetingHeatmap v-if="activeTab === 'heatmap'" />
      <TriagemPanel v-if="activeTab === 'triagem'" />
      <ReportsPanel v-if="activeTab === 'relatorios'" />
      
      <!-- Painel de Gestão de Cargos Temporários (T016) -->
      <div v-if="activeTab === 'gestores' && isGestorFixo" class="glass-card">
        <h3 style="color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
          Atribuição de Gestor Temporário
        </h3>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 2rem;">
          Atribua permissões de coordenação temporária para Bruno Gestor e Emmanuel Gestor. Gestores temporários podem auditar horas, triar novos candidatos e gerar relatórios.
        </p>

        <div v-if="isLoadingGestores" style="color: var(--text-secondary); font-style: italic;">
          Carregando gestores...
        </div>
        <div v-else style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.9rem;">
                <th style="padding: 1rem 0.75rem;">Nome</th>
                <th style="padding: 1rem 0.75rem;">E-mail</th>
                <th style="padding: 1rem 0.75rem;">Cargo Atual</th>
                <th style="padding: 1rem 0.75rem; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="monitor in tempGestores" :key="monitor.id" style="border-bottom: 1px solid var(--border-color); font-size: 0.95rem;">
                <td style="padding: 1rem 0.75rem; color: var(--text-primary); font-weight: 500;">
                  {{ monitor.nome }}
                </td>
                <td style="padding: 1rem 0.75rem; color: var(--text-secondary);">
                  {{ monitor.email }}
                </td>
                <td style="padding: 1rem 0.75rem;">
                  <span 
                    :style="{
                      color: monitor.role === 'gestor_temporario' ? 'var(--color-primary)' : monitor.role === 'gestor_fixo' ? 'var(--accent-green)' : 'var(--text-secondary)',
                      fontWeight: '600'
                    }"
                  >
                    {{ monitor.role === 'gestor_temporario' ? 'Gestor Temporário' : monitor.role === 'gestor_fixo' ? 'Gestor Fixo' : 'Voluntário' }}
                  </span>
                </td>
                <td style="padding: 1rem 0.75rem; text-align: right;">
                  <button 
                    v-if="monitor.role !== 'gestor_fixo'"
                    type="button" 
                    @click="toggleRole(monitor)" 
                    class="btn-primary" 
                    style="padding: 0.4rem 1.25rem; font-size: 0.85rem;"
                  >
                    {{ monitor.role === 'gestor_temporario' ? 'Revogar Gestão' : 'Promover a Gestor' }}
                  </button>
                  <span v-else style="color: var(--text-secondary); font-size: 0.85rem; font-style: italic; padding-right: 0.5rem;">
                    Gestor Permanente
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="gestoresError" style="color: var(--accent-red); margin-top: 1.5rem; font-weight: 500;">
          ⚠️ {{ gestoresError }}
        </div>
        <div v-if="gestoresSuccess" style="color: var(--accent-green); margin-top: 1.5rem; font-weight: 500;">
          ✓ {{ gestoresSuccess }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.05rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab-btn:hover {
  color: var(--color-primary-dark);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

@media (max-width: 768px) {
  .dashboard-title {
    font-size: 1.75rem !important;
  }
}
</style>
