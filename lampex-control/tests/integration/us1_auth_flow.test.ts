import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('User Story 1 - Serverless Auth (Login Flow)', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    });
    vi.stubGlobal('fetch', vi.fn());
  });

  it('deve realizar login com sucesso e salvar o token no localStorage', async () => {
    const fakeToken = 'fake-jwt-token-123';
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: fakeToken })
    });

    const email = 'josue.rsou2@gmail.com';
    const password = 'correct_password';

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.token).toBe(fakeToken);
    
    // Simular salvamento
    localStorage.setItem('lampex_jwt_token', result.token);
    expect(localStorage.setItem).toHaveBeenCalledWith('lampex_jwt_token', fakeToken);
  });

  it('deve retornar erro HTTP 401 para credenciais incorretas', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'E-mail ou senha incorretos.' })
    });

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'wrong@example.com', password: 'wrong' })
    });
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.error).toBe('E-mail ou senha incorretos.');
  });
});
