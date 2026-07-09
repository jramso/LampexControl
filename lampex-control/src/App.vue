<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { setAuthHeader } from './services/apiClient';

const router = useRouter();
const isLoggedIn = ref(false);
const userRole = ref('');
const userName = ref('');
const isMenuOpen = ref(false);

const checkAuth = () => {
  const token = localStorage.getItem('lampex_jwt_token');
  isLoggedIn.value = !!token;
  userRole.value = localStorage.getItem('lampex_user_role') || '';
  userName.value = localStorage.getItem('lampex_user_name') || '';
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

onMounted(() => {
  checkAuth();
  // Escuta mudanças de auth customizadas
  window.addEventListener('auth-change', checkAuth);
});

router.afterEach(() => {
  closeMenu();
});

const handleLogout = () => {
  localStorage.removeItem('lampex_jwt_token');
  localStorage.removeItem('lampex_user_role');
  localStorage.removeItem('lampex_user_name');
  setAuthHeader(null);
  isLoggedIn.value = false;
  userRole.value = '';
  userName.value = '';
  closeMenu();
  router.push({ name: 'Home' });
};
</script>

<template>
  <div class="glass-container">
    <nav class="navbar">
      <router-link :to="{ name: 'Home' }" class="nav-logo" @click="closeMenu">LampexControl</router-link>
      
      <!-- Hamburger Menu Button for Mobile -->
      <button 
        @click="toggleMenu" 
        class="nav-toggle-btn" 
        :class="{ active: isMenuOpen }" 
        aria-label="Toggle Menu"
      >
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>
      
      <div class="nav-links" :class="{ 'nav-links-open': isMenuOpen }">
        <router-link :to="{ name: 'Home' }" class="nav-link" active-class="active" @click="closeMenu">Home</router-link>
        <router-link :to="{ name: 'RequestStatus' }" class="nav-link" active-class="active" @click="closeMenu">Status</router-link>
        <router-link :to="{ name: 'MonitoriaRapida' }" class="nav-link" active-class="active" @click="closeMenu">Monitoria Rápida</router-link>
        
        <!-- Links Dinâmicos por Perfil -->
        <template v-if="isLoggedIn">
          <router-link 
            v-if="userRole === 'monitor'" 
            :to="{ name: 'WeeklySubmission' }" 
            class="nav-link" 
            active-class="active"
            @click="closeMenu"
          >
            Registrar Semana
          </router-link>
          
          <router-link 
            v-if="userRole === 'gestor'" 
            :to="{ name: 'ManagerDashboard' }" 
            class="nav-link" 
            active-class="active"
            @click="closeMenu"
          >
            Painel Gestor
          </router-link>
          
          <router-link :to="{ name: 'MonitorProfile' }" class="nav-link" active-class="active" @click="closeMenu">
            Meu Perfil
          </router-link>
          
          <span class="nav-link user-greeting" style="color: #fff; font-weight: 600;">
            Olá, {{ userName }}
          </span>
          <button @click="handleLogout" class="btn-secondary" style="padding: 0.5rem 1rem; border-color: rgba(255, 255, 255, 0.4); color: #fff;">
            Sair
          </button>
        </template>
        
        <router-link v-else :to="{ name: 'Login' }" class="btn-secondary" style="padding: 0.5rem 1.25rem; border-color: #fff; color: var(--color-primary); background-color: #fff; font-weight: 600;" @click="closeMenu">
          Acesso Monitor
        </router-link>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2026 Lampex Control. Todos os direitos reservados.</p>
        <div class="footer-links">
          <a href="https://www.instagram.com/lampex.ifes/" target="_blank" rel="noopener" class="footer-link">Instagram</a>
          <a href="https://www.linkedin.com/school/lampexifesserra/posts/?feedView=all" target="_blank" rel="noopener" class="footer-link">LinkedIn</a>
          <a href="https://serra.ifes.edu.br" target="_blank" rel="noopener" class="footer-link">Ifes Campus Serra</a>
        </div>
      </div>
    </footer>
  </div>
</template>

