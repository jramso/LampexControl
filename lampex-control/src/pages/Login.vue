<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apiClient, setAuthHeader } from '../services/apiClient';

const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const handleLogin = async () => {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    // Chamar RPC de login
    const { data, error } = await apiClient.rpc('login', {
      email: email.value,
      password: password.value
    });

    if (error) {
      if (error.message && error.message.includes('rate_limit_exceeded')) {
        errorMessage.value = 'Limite de tentativas excedido. Tente novamente mais tarde.';
      } else {
        errorMessage.value = 'E-mail ou senha incorretos.';
      }
      isLoading.value = false;
      return;
    }

    const token = data as string;
    const claims = parseJwt(token);

    if (claims) {
      localStorage.setItem('lampex_jwt_token', token);
      localStorage.setItem('lampex_user_role', claims.role);
      localStorage.setItem('lampex_user_id', claims.id);
      
      setAuthHeader(token);

      // Buscar nome completo do monitor para exibição
      const { data: monitorData } = await apiClient
        .from('monitor')
        .select('nome')
        .eq('id', claims.id)
        .single();

      if (monitorData) {
        localStorage.setItem('lampex_user_name', monitorData.nome);
      } else {
        localStorage.setItem('lampex_user_name', claims.email.split('@')[0]);
      }

      // Notifica o App.vue para redesenhar a navbar
      window.dispatchEvent(new Event('auth-change'));

      // Redireciona para rota original ou página inicial baseada na role
      const redirectPath = route.query.redirect as string;
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push(claims.role === 'gestor' ? { name: 'ManagerDashboard' } : { name: 'MonitorProfile' });
      }
    } else {
      errorMessage.value = 'Erro ao processar token de autenticação.';
    }
  } catch (err: any) {
    errorMessage.value = 'Erro de conexão com o barramento PostgREST.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div style="max-width: 450px; margin: 4rem auto 0 auto;">
    <div class="glass-card">
      <h2 style="text-align: center; margin-bottom: 2rem; color: #fff;">Área do Membro</h2>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">E-mail Corporativo</label>
          <input v-model="email" type="email" class="form-input" placeholder="seuemail@ifes.edu.br" required />
        </div>
        
        <div class="form-group">
          <label class="form-label">Senha</label>
          <input v-model="password" type="password" class="form-input" placeholder="••••••••" required />
        </div>

        <p v-if="errorMessage" style="color: var(--accent-red); margin-bottom: 1.5rem; font-weight: 500; font-size: 0.9rem;">
          ⚠️ {{ errorMessage }}
        </p>

        <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.9rem;" :disabled="isLoading">
          {{ isLoading ? 'Autenticando...' : 'Entrar no Sistema' }}
        </button>
      </form>
      
      <div style="margin-top: 1.5rem; text-align: center; font-size: 0.85rem; color: var(--text-muted);">
        Acesso restrito para voluntários, bolsistas e coordenação do LAMPEX.
      </div>
    </div>
  </div>
</template>
