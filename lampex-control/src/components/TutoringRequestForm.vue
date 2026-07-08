<script setup lang="ts">
import { ref, watch } from 'vue';
import { createTutoringRequest } from '../services/apiService';

const emit = defineEmits(['submitted']);

const nome = ref('');
const email = ref('');
const telefone = ref('');
const cpf = ref('');
const descricao = ref('');
const formato = ref('Presencial');
const horarioDia = ref('Segunda-Feira');
const horarioBloco = ref('Matutino (08:00 - 12:00)');

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
  
  if (!nome.value || !email.value || !telefone.value || !cpf.value || !descricao.value) {
    errorMessage.value = 'Por favor, preencha todos os campos obrigatórios.';
    return;
  }

  if (!validateCPF(cpf.value)) {
    errorMessage.value = 'CPF inválido. Certifique-se de digitar exatamente 11 dígitos.';
    return;
  }

  isSubmitting.value = true;
  
  try {
    const horarios = {
      dia: horarioDia.value,
      bloco: horarioBloco.value
    };

    await createTutoringRequest({
      nome_aluno: nome.value,
      email_aluno: email.value,
      telefone_aluno: telefone.value,
      cpf_aluno: cpf.value.replace(/\D/g, ''),
      descricao_duvida: descricao.value,
      formato: formato.value as 'Presencial' | 'Online',
      horarios_disponiveis: horarios
    });

    successMessage.value = 'Solicitação de monitoria enviada com sucesso!';
    emit('submitted');
    // Limpar formulário
    nome.value = '';
    email.value = '';
    telefone.value = '';
    cpf.value = '';
    descricao.value = '';
  } catch (err: any) {
    if (err.message && err.message.includes('rate_limit_exceeded')) {
      errorMessage.value = 'Limite de requisições excedido. Tente novamente mais tarde.';
    } else {
      errorMessage.value = `Erro ao salvar solicitação: ${err.message || err}`;
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="glass-card" style="max-width: 600px; margin: 0 auto;">
    <h2 style="margin-bottom: 1.5rem; color: #fff; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
      Solicitar Monitoria
    </h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label">Nome Completo *</label>
        <input v-model="nome" type="text" class="form-input" placeholder="Digite seu nome" required />
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

      <div class="form-group">
        <label class="form-label">CPF (Obrigatório para certificado) *</label>
        <input v-model="cpf" type="text" class="form-input" placeholder="Ex: 123.456.789-01" maxlength="14" required />
      </div>

      <div class="form-group">
        <label class="form-label">Descrição da Dúvida / Assunto *</label>
        <textarea v-model="descricao" class="form-textarea" rows="4" placeholder="Descreva os tópicos que deseja ajuda" required></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Formato de Preferência *</label>
        <select v-model="formato" class="form-select">
          <option value="Presencial">Presencial (Sala 918S ou Laboratórios)</option>
          <option value="Online">Online (Discord / Teams / Google Meet)</option>
        </select>
      </div>

      <div class="form-group responsive-grid-2" style="gap: 1rem;">
        <div>
          <label class="form-label">Dia Preferencial *</label>
          <select v-model="horarioDia" class="form-select">
            <option value="Segunda-Feira">Segunda-Feira</option>
            <option value="Terça-Feira">Terça-Feira</option>
            <option value="Quarta-Feira">Quarta-Feira</option>
            <option value="Quinta-Feira">Quinta-Feira</option>
            <option value="Sexta-Feira">Sexta-Feira</option>
          </select>
        </div>
        <div>
          <label class="form-label">Bloco de Horário *</label>
          <select v-model="horarioBloco" class="form-select">
            <option value="Matutino (08:00 - 12:00)">Matutino (08:00 - 12:00)</option>
            <option value="Vespertino (13:00 - 17:00)">Vespertino (13:00 - 17:00)</option>
            <option value="Noturno (18:00 - 22:00)">Noturno (18:00 - 22:00)</option>
          </select>
        </div>
      </div>

      <div v-if="errorMessage" style="color: var(--accent-red); margin-bottom: 1rem; font-weight: 500;">
        ⚠️ {{ errorMessage }}
      </div>

      <div v-if="successMessage" style="color: var(--accent-green); margin-bottom: 1rem; font-weight: 500;">
        ✓ {{ successMessage }}
      </div>

      <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;" :disabled="isSubmitting">
        {{ isSubmitting ? 'Enviando...' : 'Submeter Solicitação' }}
      </button>
    </form>
  </div>
</template>
