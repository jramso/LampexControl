<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: Record<string, Record<string, number>>;
}>();

const emit = defineEmits(['update:modelValue']);

const days = ['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira'];
const blocks = ['Matutino', 'Vespertino', 'Noturno'];

// Inicializar matriz a partir da prop
const matrix = ref<Record<string, Record<string, number>>>({});

const initializeMatrix = () => {
  const initial = props.modelValue && Object.keys(props.modelValue).length > 0
    ? JSON.parse(JSON.stringify(props.modelValue))
    : {};
    
  days.forEach(day => {
    if (!initial[day]) initial[day] = {};
    blocks.forEach(block => {
      if (initial[day][block] === undefined) {
        initial[day][block] = 0.0; // Indisponível por padrão
      }
    });
  });
  
  matrix.value = initial;
};

// Monitorar alterações externas na prop
watch(() => props.modelValue, initializeMatrix, { immediate: true, deep: true });

// Emitir alterações
const setAvailability = (day: string, block: string, val: number) => {
  matrix.value[day][block] = val;
  emit('update:modelValue', JSON.parse(JSON.stringify(matrix.value)));
};
</script>

<template>
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
          
          <td v-for="day in days" :key="day" style="padding: 0.5rem;">
            <div style="display: flex; flex-direction: column; gap: 0.25rem; align-items: center;">
              <!-- Botões de Opção Premium com Micro-animações -->
              <button 
                type="button"
                @click="setAvailability(day, block, 1.0)"
                class="matrix-btn"
                :class="{ active: matrix[day]?.[block] === 1.0 }"
                style="--btn-color: var(--accent-green);"
              >
                <span class="desktop-text">Presencial (1.0)</span>
                <span class="mobile-text">Pres. (1.0)</span>
              </button>
              <button 
                type="button"
                @click="setAvailability(day, block, 0.5)"
                class="matrix-btn"
                :class="{ active: matrix[day]?.[block] === 0.5 }"
                style="--btn-color: var(--accent-cyan);"
              >
                <span class="desktop-text">Online (0.5)</span>
                <span class="mobile-text">On. (0.5)</span>
              </button>
              <button 
                type="button"
                @click="setAvailability(day, block, 0.0)"
                class="matrix-btn"
                :class="{ active: matrix[day]?.[block] === 0.0 }"
                style="--btn-color: var(--text-muted);"
              >
                <span class="desktop-text">Indisponível (0.0)</span>
                <span class="mobile-text">Indisp. (0.0)</span>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.matrix-btn {
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.15s ease;
}

.matrix-btn:hover {
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
}

.matrix-btn.active {
  background-color: var(--btn-color);
  border-color: var(--btn-color);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 0 8px var(--btn-color);
}

.mobile-text {
  display: none;
}

@media (max-width: 600px) {
  .desktop-text {
    display: none;
  }
  .mobile-text {
    display: inline;
  }
}
</style>
