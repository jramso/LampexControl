<script setup lang="ts">
import { ref } from 'vue';
import AuditPanel from '../components/AuditPanel.vue';
import MeetingHeatmap from '../components/MeetingHeatmap.vue';
import TriagemPanel from '../components/TriagemPanel.vue';
import { exportToSRC } from '../services/srcExport';

const activeTab = ref<'audit' | 'heatmap' | 'triagem'>('audit');

const handleExport = async () => {
  await exportToSRC();
};
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
    </div>

    <!-- Conteúdo da Aba Ativa -->
    <div>
      <AuditPanel v-if="activeTab === 'audit'" />
      <MeetingHeatmap v-if="activeTab === 'heatmap'" />
      <TriagemPanel v-if="activeTab === 'triagem'" />
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
