import { describe, it, expect, vi } from 'vitest';
import { createTutoringRequest } from '../../src/services/apiService';
import { apiClient } from '../../src/services/apiClient';

vi.mock('../../src/services/apiClient', () => {
  const mockInsert = vi.fn().mockReturnThis();
  const mockSelect = vi.fn().mockReturnThis();
  const mockSingle = vi.fn().mockResolvedValue({
    data: { id: 'test-uuid-123', nome_aluno: 'João Silva', status: 'Pendente' },
    error: null
  });

  return {
    apiClient: {
      from: vi.fn(() => ({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle
      }))
    }
  };
});

describe('User Story 1 - API Mappings Client (Request Creation)', () => {
  it('deve chamar o endpoint /solicitacoes_monitoria com os dados obrigatórios informados', async () => {
    const payload = {
      nome_aluno: 'João Silva',
      email_aluno: 'joao@example.com',
      telefone_aluno: '27999999999',
      cpf_aluno: '12345678901',
      descricao_duvida: 'Estruturas de repetição',
      formato: 'Presencial' as const,
      horarios_disponiveis: { dia: 'Segunda-Feira', bloco: 'Matutino' }
    };

    const result = await createTutoringRequest(payload);

    expect(apiClient.from).toHaveBeenCalledWith('solicitacoes_monitoria');
    expect(result).toHaveProperty('id', 'test-uuid-123');
    expect(result).toHaveProperty('status', 'Pendente');
  });
});
