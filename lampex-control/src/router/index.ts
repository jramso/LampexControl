import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import RequestStatus from '../pages/RequestStatus.vue';
import Login from '../pages/Login.vue';
import MonitorProfile from '../pages/MonitorProfile.vue';
import WeeklySubmission from '../pages/WeeklySubmission.vue';
import ManagerDashboard from '../pages/ManagerDashboard.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/status',
    name: 'RequestStatus',
    component: RequestStatus
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/perfil',
    name: 'MonitorProfile',
    component: MonitorProfile,
    meta: { requiresAuth: true, allowedRoles: ['monitor', 'gestor'] }
  },
  {
    path: '/submissao',
    name: 'WeeklySubmission',
    component: WeeklySubmission,
    meta: { requiresAuth: true, allowedRoles: ['monitor'] }
  },
  {
    path: '/dashboard',
    name: 'ManagerDashboard',
    component: ManagerDashboard,
    meta: { requiresAuth: true, allowedRoles: ['gestor'] }
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

// Helper para decodificar JWT no cliente
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

// Guard de Autenticação e Controle de Acesso baseado em Roles
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('lampex_jwt_token');
  let role = null;

  if (token) {
    const claims = parseJwt(token);
    if (claims) {
      role = claims.role;
    }
  }

  if (to.meta.requiresAuth) {
    if (!token || !role) {
      // Se não autenticado ou token inválido, limpa e redireciona
      localStorage.removeItem('lampex_jwt_token');
      localStorage.removeItem('lampex_user_role');
      return next({ name: 'Login', query: { redirect: to.fullPath } });
    }

    const allowedRoles = to.meta.allowedRoles as string[];
    if (allowedRoles && !allowedRoles.includes(role)) {
      // Se não autorizado, redireciona o monitor para seu perfil ou home
      return next({ name: role === 'monitor' ? 'MonitorProfile' : 'Home' });
    }
  }

  next();
});
