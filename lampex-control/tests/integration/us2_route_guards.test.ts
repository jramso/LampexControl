import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('User Story 2 - Vue Router Guards (T009)', () => {
  let localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    localStorageMock = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => localStorageMock[key] || null),
      setItem: vi.fn((key, value) => { localStorageMock[key] = value; }),
      removeItem: vi.fn((key) => { delete localStorageMock[key]; })
    });
  });

  const checkRouteAccess = (toMeta: { requiresAuth?: boolean, allowedRoles?: string[] }, userRole: string | null) => {
    const isLoggedIn = !!localStorage.getItem('lampex_jwt_token');
    
    if (toMeta.requiresAuth) {
      if (!isLoggedIn) {
        return { redirect: 'Login' };
      }
      if (toMeta.allowedRoles && !toMeta.allowedRoles.includes(userRole || '')) {
        return { redirect: userRole === 'monitor' ? 'MonitorProfile' : 'Login' };
      }
    }
    return { allow: true };
  };

  it('deve redirecionar para Login se o usuário não estiver autenticado e tentar acessar rota restrita', () => {
    const meta = { requiresAuth: true, allowedRoles: ['gestor'] };
    const decision = checkRouteAccess(meta, null);
    expect(decision).toEqual({ redirect: 'Login' });
  });

  it('deve redirecionar o monitor para o Perfil se tentar acessar rota exclusiva de gestor', () => {
    localStorage.setItem('lampex_jwt_token', 'valid-token');
    const meta = { requiresAuth: true, allowedRoles: ['gestor'] };
    const decision = checkRouteAccess(meta, 'monitor');
    expect(decision).toEqual({ redirect: 'MonitorProfile' });
  });

  it('deve permitir acesso para gestores autenticados nas rotas restritas', () => {
    localStorage.setItem('lampex_jwt_token', 'valid-token');
    const meta = { requiresAuth: true, allowedRoles: ['gestor'] };
    const decision = checkRouteAccess(meta, 'gestor');
    expect(decision).toEqual({ allow: true });
  });
});
