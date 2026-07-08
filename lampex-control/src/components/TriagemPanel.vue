<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getPendingVolunteers, approveVolunteer, rejectVolunteer } from '../services/apiService';

const candidates = ref<any[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');
const isProcessing = ref<string | null>(null); // Armazena o ID do candidato sendo aprovado/rejeitado

const fetchCandidates = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    candidates.value = await getPendingVolunteers();
  } catch (err: any) {
    errorMessage.value = err.message || 'Erro ao carregar a lista de triagem.';
  } finally {
    isLoading.value = false;
  }
};

const handleApprove = async (id: string, name: string) => {
  if (!confirm(`Deseja realmente aprovar o candidato ${name}? ele será promovido a monitor no sistema.`)) {
    return;
  }

  isProcessing.value = id;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    await approveVolunteer(id);
    successMessage.value = `Candidato ${name} aprovado com sucesso!`;
    // Remove o voluntário da listagem local
    candidates.value = candidates.value.filter(c => c.id !== id);
  } catch (err: any) {
    errorMessage.value = err.message || `Erro ao aprovar o candidato ${name}.`;
  } finally {
    isProcessing.value = null;
  }
};

const handleReject = async (id: string, name: string) => {
  if (!confirm(`Deseja realmente rejeitar o candidato ${name}?`)) {
    return;
  }

  isProcessing.value = id;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    await rejectVolunteer(id);
    successMessage.value = `Candidato ${name} rejeitado com sucesso.`;
    // Remove o voluntário da listagem local
    candidates.value = candidates.value.filter(c => c.id !== id);
  } catch (err: any) {
    errorMessage.value = err.message || `Erro ao rejeitar o candidato ${name}.`;
  } finally {
    isProcessing.value = null;
  }
};

onMounted(fetchCandidates);
</script>

<template>
  <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.5rem;">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
      <h3 style="color: var(--text-primary); font-size: 1.5rem; font-family: var(--font-heading);">
        Fila de Triagem de Voluntários
      </h3>
      <button @click="fetchCandidates" class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;" :disabled="isLoading">
        🔄 Atualizar Lista
      </button>
    </div>

    <!-- Alert Messages -->
    <div v-if="errorMessage" style="color: var(--accent-red); font-weight: 500; padding: 0.75rem; border: 1px solid var(--accent-red); border-radius: var(--radius-sm); background: rgba(214, 45, 32, 0.05);">
      ⚠️ {{ errorMessage }}
    </div>
    <div v-if="successMessage" style="color: var(--accent-green); font-weight: 500; padding: 0.75rem; border: 1px solid var(--accent-green); border-radius: var(--radius-sm); background: rgba(0, 135, 68, 0.05);">
      ✓ {{ successMessage }}
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" style="color: var(--text-secondary); text-align: center; padding: 3rem; font-family: var(--font-body);">
      Carregando candidatos da triagem...
    </div>

    <template v-else>
      <!-- Empty State -->
      <div v-if="candidates.length === 0" style="color: var(--text-muted); text-align: center; padding: 3rem; font-style: italic;">
        Nenhum voluntário pendente de triagem no momento.
      </div>

      <!-- Desktop Table View -->
      <div class="desktop-only table-container" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-family: var(--font-body);">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-secondary); font-family: var(--font-heading); font-weight: 600;">
              <th style="padding: 1rem 0.5rem;">Candidato</th>
              <th style="padding: 1rem 0.5rem;">Matrícula</th>
              <th style="padding: 1rem 0.5rem;">Curso</th>
              <th style="padding: 1rem 0.5rem;">Origem do Cadastro</th>
              <th style="padding: 1rem 0.5rem;">Data de Inscrição</th>
              <th style="padding: 1rem 0.5rem; text-align: center;">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="candidate in candidates" 
              :key="candidate.id"
              style="border-bottom: 1px solid var(--border-color); transition: background-color var(--transition-fast);"
              class="table-row-hover"
            >
              <td style="padding: 1rem 0.5rem;">
                <div style="font-weight: 600; color: var(--text-primary);">{{ candidate.nome }}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">
                  {{ candidate.email }} • {{ candidate.telefone }}
                </div>
              </td>
              <td style="padding: 1rem 0.5rem; color: var(--text-primary);">
                {{ candidate.matricula }}
              </td>
              <td style="padding: 1rem 0.5rem; color: var(--text-primary);">
                {{ candidate.curso }}
              </td>
              <td style="padding: 1rem 0.5rem;">
                <span class="origin-badge">{{ candidate.origem_cadastro }}</span>
              </td>
              <td style="padding: 1rem 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">
                {{ new Date(candidate.created_at).toLocaleDateString() }}
              </td>
              <td style="padding: 1rem 0.5rem; text-align: center;">
                <div style="display: flex; gap: 0.5rem; justify-content: center;">
                  <button 
                    @click="handleApprove(candidate.id, candidate.nome)"
                    class="action-btn approve"
                    :disabled="isProcessing !== null"
                  >
                    {{ isProcessing === candidate.id ? 'Aprovando...' : 'Aprovar' }}
                  </button>
                  <button 
                    @click="handleReject(candidate.id, candidate.nome)"
                    class="action-btn reject"
                    :disabled="isProcessing !== null"
                  >
                    {{ isProcessing === candidate.id ? 'Rejeitando...' : 'Rejeitar' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards View -->
      <div class="mobile-only card-list-container">
        <div 
          v-for="candidate in candidates" 
          :key="candidate.id"
          class="candidate-card"
        >
          <div class="card-header-row">
            <div class="candidate-name">{{ candidate.nome }}</div>
            <span class="origin-badge">{{ candidate.origem_cadastro }}</span>
          </div>
          
          <div class="card-details">
            <p><strong>Matrícula:</strong> {{ candidate.matricula }}</p>
            <p><strong>Curso:</strong> {{ candidate.curso }}</p>
            <p><strong>E-mail:</strong> <a :href="'mailto:' + candidate.email" style="color: var(--color-primary);">{{ candidate.email }}</a></p>
            <p><strong>WhatsApp:</strong> <a :href="'https://wa.me/' + candidate.telefone.replace(/\D/g, '')" target="_blank" style="color: var(--color-primary);">{{ candidate.telefone }}</a></p>
            <p><strong>Inscrição:</strong> {{ new Date(candidate.created_at).toLocaleDateString() }}</p>
          </div>

          <div class="card-actions">
            <button 
              @click="handleApprove(candidate.id, candidate.nome)"
              class="action-btn approve"
              :disabled="isProcessing !== null"
            >
              {{ isProcessing === candidate.id ? 'Aprovando...' : 'Aprovar' }}
            </button>
            <button 
              @click="handleReject(candidate.id, candidate.nome)"
              class="action-btn reject"
              :disabled="isProcessing !== null"
            >
              {{ isProcessing === candidate.id ? 'Rejeitando...' : 'Rejeitar' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

.table-row-hover:hover {
  background-color: var(--color-bg-subtle);
}

.origin-badge {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-sm);
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-btn {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast) ease;
}

.action-btn.approve {
  background-color: var(--color-primary);
  color: var(--color-text-light);
}

.action-btn.approve:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 135, 68, 0.2);
}

.action-btn.reject {
  background-color: var(--color-accent);
  color: var(--color-text-light);
}

.action-btn.reject:hover:not(:disabled) {
  background-color: #b22016;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(214, 45, 32, 0.2);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Card list styling */
.card-list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.candidate-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: var(--shadow-sm);
  text-align: left;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.candidate-name {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.card-details {
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.card-actions .action-btn {
  flex: 1;
  min-height: var(--touch-target-min, 44px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  
  .mobile-only {
    display: flex !important;
  }
}
</style>
