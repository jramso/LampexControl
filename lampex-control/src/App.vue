<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { setAuthHeader } from './services/apiClient';

const router = useRouter();
const isLoggedIn = ref(false);
const userRole = ref('');
const userName = ref('');

const checkAuth = () => {
  const token = localStorage.getItem('lampex_jwt_token');
  isLoggedIn.value = !!token;
  userRole.value = localStorage.getItem('lampex_user_role') || '';
  userName.value = localStorage.getItem('lampex_user_name') || '';
};

onMounted(() => {
  checkAuth();
  // Escuta mudanças de auth customizadas
  window.addEventListener('auth-change', checkAuth);
});

const handleLogout = () => {
  localStorage.removeItem('lampex_jwt_token');
  localStorage.removeItem('lampex_user_role');
  localStorage.removeItem('lampex_user_name');
  setAuthHeader(null);
  isLoggedIn.value = false;
  userRole.value = '';
  userName.value = '';
  router.push({ name: 'Home' });
};
</script>

<template>
  <div class="glass-container">
    <nav class="navbar">
      <router-link :to="{ name: 'Home' }" class="nav-logo">LampexControl</router-link>
      
      <div class="nav-links">
        <router-link :to="{ name: 'Home' }" class="nav-link" active-class="active">Home</router-link>
        <router-link :to="{ name: 'RequestStatus' }" class="nav-link" active-class="active">Status</router-link>
        
        <!-- Links Dinâmicos por Perfil -->
        <template v-if="isLoggedIn">
          <router-link 
            v-if="userRole === 'monitor'" 
            :to="{ name: 'WeeklySubmission' }" 
            class="nav-link" 
            active-class="active"
          >
            Registrar Semana
          </router-link>
          
          <router-link 
            v-if="userRole === 'gestor'" 
            :to="{ name: 'ManagerDashboard' }" 
            class="nav-link" 
            active-class="active"
          >
            Painel Gestor
          </router-link>
          
          <router-link :to="{ name: 'MonitorProfile' }" class="nav-link" active-class="active">
            Meu Perfil
          </router-link>
          
          <span class="nav-link" style="color: var(--accent-cyan); font-weight: 600;">
            Olá, {{ userName }}
          </span>
          <button @click="handleLogout" class="btn-secondary" style="padding: 0.5rem 1rem;">
            Sair
          </button>
        </template>
        
        <router-link v-else :to="{ name: 'Login' }" class="btn-primary" style="padding: 0.5rem 1.25rem;">
          Acesso Monitor
        </router-link>
      </div>
    </nav>

    <main style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
      <router-view />
    </main>
  </div>
</template>
