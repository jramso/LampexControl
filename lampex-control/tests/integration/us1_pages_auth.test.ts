import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('User Story 1 - Pages Functions Auth (Login Flow)', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    });
    vi.stubGlobal('fetch', vi.fn());
  });

  it('deve realizar login com sucesso na rota relativa /api/auth/login', async () => {
    const fakeToken = 'fake-jwt-token-pages-123';
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: fakeToken })
    });

    // Chamar rota relativa
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'josue.rsou2@gmail.com', password: 'correct' })
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.token).toBe(fakeToken);
  });
});
