import { describe, it, expect, vi } from 'vitest';
import { getGeneralHeatmap, getMonitorContact } from '../../src/services/apiService';
import { apiClient } from '../../src/services/apiClient';

vi.mock('../../src/services/apiClient', () => {
  const mockSelect = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockResolvedValue({
    data: [
      { chamado_id: 'chamado-1', monitor_nome: 'Gabriel Costa', monitor_telefone: '27888888888', monitor_plataforma: 'WhatsApp' }
    ],
    error: null
  });

  const mockSelectHeatmap = vi.fn().mockResolvedValue({
    data: [
      { dia_semana: 'Segunda-Feira', bloco_horario: 'Matutino', peso_total: 3.5 }
    ],
    error: null
  });

  return {
    apiClient: {
      from: vi.fn((relation) => {
        if (relation === 'view_reuniao_geral') {
          return { select: mockSelectHeatmap };
        }
        return {
          select: mockSelect,
          eq: mockEq,
          order: mockOrder,
          limit: mockLimit
        };
      })
    }
  };
});

describe('User Story 3 - API Mappings Client (Views)', () => {
  it('deve consultar a view /view_reuniao_geral e retornar os pesos do heatmap', async () => {
    const data = await getGeneralHeatmap();
    expect(apiClient.from).toHaveBeenCalledWith('view_reuniao_geral');
    expect(data[0]).toHaveProperty('peso_total', 3.5);
  });

  it('deve consultar a view /view_contato_monitor utilizando o CPF do aluno', async () => {
    const contact = await getMonitorContact('12345678901');
    expect(apiClient.from).toHaveBeenCalledWith('view_contato_monitor');
    expect(contact).toHaveProperty('monitor_nome', 'Gabriel Costa');
    expect(contact).toHaveProperty('monitor_telefone', '27888888888');
  });
});
