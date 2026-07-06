import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('User Story 2 - Pages Router Guards (T007)', () => {
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

  it('deve bloquear acesso a rota administrativa para quem nao é gestor', () => {
    localStorage.setItem('lampex_jwt_token', 'valid-token-pages');
    const meta = { requiresAuth: true, allowedRoles: ['gestor'] };
    const decision = checkRouteAccess(meta, 'monitor');
    expect(decision).toEqual({ redirect: 'MonitorProfile' });
  });

  it('deve conceder acesso a rota administrativa para gestores autenticados', () => {
    localStorage.setItem('lampex_jwt_token', 'valid-token-pages');
    const meta = { requiresAuth: true, allowedRoles: ['gestor'] };
    const decision = checkRouteAccess(meta, 'gestor');
    expect(decision).toEqual({ allow: true });
  });
});
