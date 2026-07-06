<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getGeneralHeatmap } from '../services/apiService';

const days = ['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira'];
const blocks = ['Matutino', 'Vespertino', 'Noturno'];

const heatmapData = ref<Record<string, Record<string, number>>>({});
const isLoading = ref(true);
const selectedCell = ref<any>(null);

const fetchHeatmap = async () => {
  isLoading.value = true;
  try {
    const data = await getGeneralHeatmap();

    if (data) {
      const formatted: Record<string, Record<string, number>> = {};
      days.forEach(day => {
        formatted[day] = {};
        blocks.forEach(block => {
          formatted[day][block] = 0.0;
        });
      });

      data.forEach((row: any) => {
        if (formatted[row.dia_semana]) {
          formatted[row.dia_semana][row.bloco_horario] = Number(row.peso_total || 0);
        }
      });
      heatmapData.value = formatted;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchHeatmap);

// Determinar classe de cor com base no peso total
const getColorClass = (weight: number) => {
  if (weight === 0) return 'heatmap-cell-0';
  if (weight <= 1.0) return 'heatmap-cell-1';
  if (weight <= 2.0) return 'heatmap-cell-2';
  if (weight <= 3.0) return 'heatmap-cell-3';
  if (weight <= 5.0) return 'heatmap-cell-4';
  return 'heatmap-cell-5';
};

const showCellDetails = (day: string, block: string, weight: number) => {
  selectedCell.value = { day, block, weight };
};
</script>

<template>
  <div class="glass-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h3 style="color: #fff;">Mapa de Calor de Disponibilidade para Reunião Geral</h3>
      <button @click="fetchHeatmap" class="btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
        Atualizar
      </button>
    </div>

    <div v-if="isLoading" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
      Carregando mapa de calor...
    </div>

    <div v-else>
      <div style="width: 100%; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: center;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color);">
              <th style="padding: 0.75rem; text-align: left; color: var(--text-secondary);">Período</th>
              <th v-for="day in days" :key="day" style="padding: 0.75rem; color: #fff;">
                {{ day.split('-')[0] }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="block in blocks" :key="block" style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 1rem 0.75rem; text-align: left; font-weight: 600; color: var(--text-secondary);">
                {{ block }}
              </td>
              <td 
                v-for="day in days" 
                :key="day" 
                style="padding: 0.5rem;"
              >
                <div 
                  @click="showCellDetails(day, block, heatmapData[day]?.[block] || 0)"
                  class="heatmap-cell" 
                  :class="getColorClass(heatmapData[day]?.[block] || 0)"
                  style="height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; cursor: pointer;"
                >
                  {{ (heatmapData[day]?.[block] || 0).toFixed(1) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Legenda de Cores -->
      <div style="display: flex; gap: 1rem; align-items: center; margin-top: 1.5rem; justify-content: center; font-size: 0.8rem; color: var(--text-secondary);">
        <span>Menor Disponibilidade</span>
        <div style="display: flex; gap: 0.25rem;">
          <div class="heatmap-cell-0" style="width: 16px; height: 16px; border-radius: 3px;"></div>
          <div class="heatmap-cell-1" style="width: 16px; height: 16px; border-radius: 3px;"></div>
          <div class="heatmap-cell-2" style="width: 16px; height: 16px; border-radius: 3px;"></div>
          <div class="heatmap-cell-3" style="width: 16px; height: 16px; border-radius: 3px;"></div>
          <div class="heatmap-cell-4" style="width: 16px; height: 16px; border-radius: 3px;"></div>
          <div class="heatmap-cell-5" style="width: 16px; height: 16px; border-radius: 3px;"></div>
        </div>
        <span>Maior Disponibilidade</span>
      </div>

      <!-- Detalhes do Bloco Selecionado -->
      <div 
        v-if="selectedCell" 
        style="margin-top: 1.5rem; padding: 1rem; background: rgba(6, 182, 212, 0.05); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: var(--radius-md); text-align: center;"
      >
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Janela de Reunião Selecionada: 
          <strong style="color: #fff;">{{ selectedCell.day }} ({{ selectedCell.block }})</strong>
        </p>
        <p style="color: var(--accent-cyan); font-size: 1.25rem; font-weight: 700; margin-top: 0.25rem;">
          Score de Disponibilidade Acumulado: {{ selectedCell.weight.toFixed(1) }}
        </p>
      </div>
    </div>
  </div>
</template>
