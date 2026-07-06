import { describe, it, expect, vi } from 'vitest';
import { submitWeeklyReport } from '../../src/services/apiService';
import { apiClient } from '../../src/services/apiClient';

vi.mock('../../src/services/apiClient', () => {
  const mockRpc = vi.fn().mockResolvedValue({
    data: 'new-report-uuid-456',
    error: null
  });

  return {
    apiClient: {
      rpc: mockRpc
    }
  };
});

describe('User Story 2 - API Mappings Client (Weekly Submission RPC)', () => {
  it('deve chamar a RPC registro_horas com os parâmetros consolidados', async () => {
    const payload = {
      semana_ref: '2026-07-06',
      pdf_url: 'http://example.com/relatorio.pdf',
      atividades: [
        { tipo_atividade: 'Monitoria', horas_brutas: 4.0, evidencia_url: 'http://evidencia.com' }
      ]
    };

    const result = await submitWeeklyReport(payload);

    expect(apiClient.rpc).toHaveBeenCalledWith('registro_horas', {
      semana_ref: payload.semana_ref,
      pdf_url: payload.pdf_url,
      atividades: payload.atividades
    });
    expect(result).toBe('new-report-uuid-456');
  });
});
