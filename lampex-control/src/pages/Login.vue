<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apiClient, setAuthHeader, getApiUrl } from '../services/apiClient';
import ifesLogo from '../assets/ifes_icon.png';
import lampexLogo from '../assets/lampex_icon.jpg';

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
    const response = await fetch(`${getApiUrl()}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      errorMessage.value = errData.error || 'E-mail ou senha incorretos.';
      isLoading.value = false;
      return;
    }

    const { token } = await response.json();
    const claims = parseJwt(token);

    if (claims) {
      localStorage.setItem('lampex_jwt_token', token);
      localStorage.setItem('lampex_user_role', claims.role);
      localStorage.setItem('lampex_user_id', claims.id);
      
      setAuthHeader(token);

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

      window.dispatchEvent(new Event('auth-change'));

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
    errorMessage.value = 'Erro de conexão com o servidor de autenticação serverless.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div style="max-width: 450px; width: 100%; margin: 2rem auto; padding: 0 1rem;">
    <div class="glass-card">

      <div style="display: flex; justify-content: center; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem;">
        <img :src="lampexLogo" alt="LAMPEX Logo" style="height: 50px; object-fit: contain;" />
        <div style="width: 1px; height: 35px; background-color: var(--border-color);"></div>
        <img :src="ifesLogo" alt="IFES Logo" style="height: 50px; object-fit: contain;" />
      </div>
      
      <h2 style="text-align: center; margin-bottom: 2rem; color: var(--text-primary);">Área do Membro</h2>
      
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
