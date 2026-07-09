<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '../services/apiClient';
import AvailabilityMatrix from '../components/AvailabilityMatrix.vue';
import { createClassPasscode, getClassPasscodes, closeClassPasscode } from '../services/apiService';

const nome = ref('');
const email = ref('');
const telefone = ref('');
const permiteExibir = ref(false);
const plataforma = ref('WhatsApp');
const matriz = ref<Record<string, Record<string, number>>>({});
const role = ref('');

const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Professor specific states
const classPasscodes = ref<any[]>([]);
const newPasscode = ref('');
const isCreatingPasscode = ref(false);
const passcodeError = ref('');
const passcodeSuccess = ref('');

// Professors list for monitors
const professors = ref<any[]>([]);
const selectedProfessorId = ref<string>('');

const fetchPasscodes = async () => {
  try {
    classPasscodes.value = await getClassPasscodes();
  } catch (err: any) {
    console.error('Erro ao carregar senhas de aula:', err);
  }
};

const fetchProfessors = async () => {
  try {
    const { data, error } = await apiClient
      .from('usuario')
      .select('id, nome')
      .eq('role', 'professor')
      .order('nome', { ascending: true });
      
    if (error) throw error;
    professors.value = data || [];
    if (professors.value.length > 0) {
      selectedProfessorId.value = professors.value[0].id;
    }
  } catch (err: any) {
    console.error('Erro ao carregar professores:', err);
  }
};

const fetchProfile = async () => {
  const monitorId = localStorage.getItem('lampex_user_id');
  if (!monitorId) {
    errorMessage.value = 'Usuário não autenticado.';
    isLoading.value = false;
    return;
  }

  try {
    const { data, error } = await apiClient
      .from('usuario')
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
      role.value = data.role;

      if (role.value === 'professor') {
        await fetchPasscodes();
      } else {
        await fetchProfessors();
        await fetchPasscodes();
      }
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
      .from('usuario')
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

const handleCreatePasscode = async () => {
  if (!newPasscode.value.trim()) return;
  isCreatingPasscode.value = true;
  passcodeError.value = '';
  passcodeSuccess.value = '';
  try {
    const profId = role.value !== 'professor' ? selectedProfessorId.value : undefined;
    await createClassPasscode(newPasscode.value.trim(), profId);
    passcodeSuccess.value = 'Senha de aula criada com sucesso!';
    newPasscode.value = '';
    await fetchPasscodes();
  } catch (err: any) {
    passcodeError.value = err.message || 'Erro ao criar senha de aula.';
  } finally {
    isCreatingPasscode.value = false;
  }
};

const handleClosePasscode = async (id: string) => {
  try {
    await closeClassPasscode(id);
    await fetchPasscodes();
  } catch (err: any) {
    passcodeError.value = err.message || 'Erro ao encerrar recebimento.';
  }
};
</script>

<template>
  <div style="max-width: 900px; margin: 0 auto; padding-bottom: 4rem;">
    <h1 style="margin-bottom: 2rem; color: var(--color-primary);">
      Configuração do Perfil & Disponibilidade
    </h1>

    <div v-if="isLoading" style="text-align: center; padding: 3rem;">
      <p style="color: var(--text-secondary);">Carregando dados do perfil...</p>
    </div>

    <div v-else-if="errorMessage && !nome" class="glass-card" style="border-color: var(--accent-red);">
      <p style="color: var(--accent-red);">⚠️ {{ errorMessage }}</p>
    </div>

    <div v-else style="display: flex; flex-direction: column; gap: 2rem;">
      <form @submit.prevent="handleSave" style="display: flex; flex-direction: column; gap: 2rem;">
        <!-- Informações Gerais & Privacidade -->
        <div class="glass-card responsive-grid-2">
          <h3 style="grid-column: span 2; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
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
              <strong style="color: var(--text-primary); display: block; font-size: 0.95rem;">Exibir dados de contato para alunos confirmados</strong>
              <span style="color: var(--text-secondary); font-size: 0.85rem; display: block;">
                Se ativo, alunos com solicitações de monitoria confirmadas associadas a você poderão visualizar seu link de WhatsApp/plataforma.
              </span>
            </label>
          </div>
        </div>

        <!-- Matriz de Disponibilidade Semanal (FR-002) -->
        <div class="glass-card">
          <h3 style="color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
            Grade de Disponibilidade Individual
          </h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
            Selecione seu formato disponível para atendimento em cada período da semana.
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

      <!-- Painel do Professor / Monitor: Controle de Senhas de Aula (T020) -->
      <div v-if="role === 'professor' || role === 'voluntario' || role === 'gestor_fixo' || role === 'gestor_temporario'" class="glass-card" style="margin-top: 1rem;">
        <h3 style="color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
          Gerenciamento de Aulas / Senhas de Presença
        </h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem;">
          Crie senhas temporárias de aula para que os estudantes presentes possam confirmar suas presenças no formulário público.
        </p>

        <!-- Dropdown para selecionar Professor (exibido apenas para Monitores/Gestores) -->
        <div v-if="role !== 'professor'" class="form-group" style="margin-bottom: 1.5rem; max-width: 400px;">
          <label class="form-label">Selecionar Professor para esta Aula</label>
          <select v-model="selectedProfessorId" class="form-select" style="width: 100%;">
            <option v-for="prof in professors" :key="prof.id" :value="prof.id">
              {{ prof.nome }}
            </option>
          </select>
        </div>

        <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
          <input 
            v-model="newPasscode" 
            type="text" 
            class="form-input" 
            placeholder="Ex: aula_segunda_10h" 
            style="flex: 1; min-width: 200px;" 
            :disabled="isCreatingPasscode"
          />
          <button 
            type="button" 
            @click="handleCreatePasscode" 
            class="btn-primary" 
            style="padding: 0.85rem 2rem;" 
            :disabled="isCreatingPasscode || !newPasscode.trim() || (role !== 'professor' && !selectedProfessorId)"
          >
            {{ isCreatingPasscode ? 'Criando...' : 'Criar Senha de Aula' }}
          </button>
        </div>

        <div v-if="passcodeError" style="color: var(--accent-red); margin-bottom: 1rem; font-weight: 500;">
          ⚠️ {{ passcodeError }}
        </div>
        <div v-if="passcodeSuccess" style="color: var(--accent-green); margin-bottom: 1rem; font-weight: 500;">
          ✓ {{ passcodeSuccess }}
        </div>

        <h4 style="color: var(--text-primary); margin-bottom: 1rem;">
          {{ role === 'professor' ? 'Suas Aulas Recentes' : 'Aulas Recentes Registradas' }}
        </h4>
        <div v-if="classPasscodes.length === 0" style="color: var(--text-secondary); font-size: 0.9rem; font-style: italic;">
          Nenhuma aula registrada.
        </div>
        <div v-else style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.9rem;">
                <th style="padding: 0.75rem;">Data</th>
                <th v-if="role !== 'professor'" style="padding: 0.75rem;">Professor</th>
                <th style="padding: 0.75rem;">Senha</th>
                <th style="padding: 0.75rem;">Status</th>
                <th style="padding: 0.75rem; text-align: right;">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pass in classPasscodes" :key="pass.id" style="border-bottom: 1px solid var(--border-color); font-size: 0.95rem;">
                <td style="padding: 0.75rem; color: var(--text-primary);">
                  {{ new Date(pass.data_aula).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) }}
                </td>
                <td v-if="role !== 'professor'" style="padding: 0.75rem; color: var(--text-secondary);">
                  {{ pass.professor_nome }}
                </td>
                <td style="padding: 0.75rem; color: var(--color-primary); font-weight: 600;">
                  {{ pass.senha_aula }}
                </td>
                <td style="padding: 0.75rem;">
                  <span 
                    :style="{
                      color: pass.status === 'Ativo' ? 'var(--accent-green)' : 'var(--text-secondary)',
                      fontWeight: '600'
                    }"
                  >
                    {{ pass.status }}
                  </span>
                </td>
                <td style="padding: 0.75rem; text-align: right;">
                  <button 
                    v-if="pass.status === 'Ativo'"
                    type="button" 
                    @click="handleClosePasscode(pass.id)" 
                    class="btn-secondary" 
                    style="padding: 0.4rem 1rem; font-size: 0.85rem; border-color: var(--accent-red); color: var(--accent-red);"
                  >
                    Encerrar
                  </button>
                  <span v-else style="color: var(--text-secondary); font-size: 0.85rem;">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .responsive-grid-2 > * {
    grid-column: span 1 !important;
  }
}

@media (max-width: 480px) {
  button[type="submit"] {
    width: 100% !important;
    align-self: stretch !important;
  }
}
</style>
