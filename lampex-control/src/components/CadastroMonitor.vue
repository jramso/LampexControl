<script setup lang="ts">
import { ref, watch } from 'vue';
import { registerVolunteer } from '../services/apiService';

const nome = ref('');
const email = ref('');
const cpf = ref('');
const telefone = ref('');
const curso = ref('');
const matricula = ref('');
const origemCadastro = ref('');

const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  const limited = digits.substring(0, 11);
  if (limited.length <= 2) {
    return limited.length > 0 ? `(${limited}` : '';
  }
  if (limited.length <= 6) {
    return `(${limited.substring(0, 2)}) ${limited.substring(2)}`;
  }
  if (limited.length <= 10) {
    return `(${limited.substring(0, 2)}) ${limited.substring(2, 6)}-${limited.substring(6)}`;
  }
  return `(${limited.substring(0, 2)}) ${limited.substring(2, 7)}-${limited.substring(7)}`;
};

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, '');
  const limited = digits.substring(0, 11);
  if (limited.length <= 3) {
    return limited;
  }
  if (limited.length <= 6) {
    return `${limited.substring(0, 3)}.${limited.substring(3)}`;
  }
  if (limited.length <= 9) {
    return `${limited.substring(0, 3)}.${limited.substring(3, 6)}.${limited.substring(6)}`;
  }
  return `${limited.substring(0, 3)}.${limited.substring(3, 6)}.${limited.substring(6, 9)}-${limited.substring(9)}`;
};

watch(telefone, (newVal) => {
  telefone.value = formatPhone(newVal);
});

watch(cpf, (newVal) => {
  cpf.value = formatCPF(newVal);
});

const validateCPF = (val: string) => {
  const clean = val.replace(/\D/g, '');
  return clean.length === 11;
};


const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!nome.value || !email.value || !cpf.value || !telefone.value || !curso.value || !matricula.value || !origemCadastro.value) {
    errorMessage.value = 'Por favor, preencha todos os campos obrigatórios.';
    return;
  }

  if (!validateCPF(cpf.value)) {
    errorMessage.value = 'CPF inválido. Certifique-se de digitar exatamente 11 dígitos.';
    return;
  }

  isSubmitting.value = true;

  try {
    await registerVolunteer({
      nome: nome.value,
      email: email.value,
      cpf: cpf.value.replace(/\D/g, ''),
      telefone: telefone.value,
      curso: curso.value,
      matricula: matricula.value,
      origem_cadastro: origemCadastro.value
    });

    successMessage.value = 'Inscrição enviada com sucesso! Aguarde a avaliação da triagem.';
    
    // Limpar formulário
    nome.value = '';
    email.value = '';
    cpf.value = '';
    telefone.value = '';
    curso.value = '';
    matricula.value = '';
    origemCadastro.value = '';
  } catch (err: any) {
    errorMessage.value = err.message || 'Erro ao realizar o cadastro. Tente novamente mais tarde.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div style="padding: 0 1rem; width: 100%;">
    <div class="glass-card" style="max-width: 600px; margin: 2rem auto;">

    <h2 style="margin-bottom: 1.5rem; color: var(--color-primary); border-bottom: 2px solid var(--color-primary); padding-bottom: 0.75rem; font-size: 1.75rem;">
      Inscrição para Voluntário/Monitor
    </h2>
    <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.95rem;">
      Preencha seus dados acadêmicos e pessoais abaixo para submeter sua ficha de candidatura ao comitê de triagem do LAMPEX.
    </p>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label">Nome Completo *</label>
        <input v-model="nome" type="text" class="form-input" placeholder="Digite seu nome completo" required />
      </div>

      <div class="form-group responsive-grid-2" style="gap: 1rem;">
        <div>
          <label class="form-label">E-mail *</label>
          <input v-model="email" type="email" class="form-input" placeholder="seuemail@exemplo.com" required />
        </div>
        <div>
          <label class="form-label">Telefone/WhatsApp *</label>
          <input v-model="telefone" type="text" class="form-input" placeholder="(27) 99999-9999" maxlength="15" required />
        </div>
      </div>

      <div class="form-group responsive-grid-2" style="gap: 1rem;">
        <div>
          <label class="form-label">CPF *</label>
          <input v-model="cpf" type="text" class="form-input" placeholder="Ex: 123.456.789-01" maxlength="14" required />
        </div>
        <div>
          <label class="form-label">Matrícula Ifes *</label>
          <input v-model="matricula" type="text" class="form-input" placeholder="Digite sua matrícula" required />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Curso *</label>
        <input v-model="curso" type="text" class="form-input" placeholder="Ex: Engenharia de Computação, TADS..." required />
      </div>

      <div class="form-group">
        <label class="form-label">Como ficou sabendo do Projeto Lampex? *</label>
        <select v-model="origemCadastro" class="form-select" required>
          <option value="" disabled selected>Selecione uma opção</option>
          <option value="Instagram">Instagram</option>
          <option value="Youtube">Youtube</option>
          <option value="Professores ou colegas de turma">Professores ou colegas de turma</option>
          <option value="Membros da Equipe Executora do Projeto Lampex">Membros da Equipe Executora do Projeto Lampex</option>
          <option value="Avisos do Ifes">Avisos do Ifes</option>
        </select>
      </div>

      <div v-if="errorMessage" style="color: var(--accent-red); margin-bottom: 1.5rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
        ⚠️ {{ errorMessage }}
      </div>

      <div v-if="successMessage" style="color: var(--accent-green); margin-bottom: 1.5rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
        ✓ {{ successMessage }}
      </div>

      <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.85rem;" :disabled="isSubmitting">
        {{ isSubmitting ? 'Enviando Candidatura...' : 'Enviar Candidatura' }}
      </button>
    </form>
  </div>
  </div>
</template>

