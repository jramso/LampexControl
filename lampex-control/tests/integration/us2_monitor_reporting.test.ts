import { describe, it, expect } from 'vitest';

// Simulação da validação do formulário de submissão do monitor (FR-004)
function validateWeeklySubmission(semanaRef: string, pdfUrl: string, atividades: any[]) {
  if (!semanaRef) return 'Semana de referência é obrigatória';
  if (!pdfUrl || !pdfUrl.endsWith('.pdf')) return 'Relatório Proex em formato PDF é obrigatório';
  if (atividades.length === 0) return 'Adicione pelo menos uma atividade';

  for (const act of atividades) {
    if (!act.tipo_atividade) return 'Tipo de atividade é obrigatório';
    if (act.horas_brutas <= 0) return 'Horas brutas devem ser maiores que zero';
    if (!act.evidencia_url) return 'URL de evidência de execução é obrigatória';
  }
  return null;
}

describe('User Story 2 - Submissão de Atividades do Monitor', () => {
  it('deve invalidar submissões sem semana de referência', () => {
    const error = validateWeeklySubmission('', 'relatorio.pdf', [{ tipo_atividade: 'Monitoria', horas_brutas: 2.0, evidencia_url: 'http://link.com' }]);
    expect(error).toBe('Semana de referência é obrigatória');
  });

  it('deve invalidar submissões sem PDF', () => {
    const error = validateWeeklySubmission('2026-W28', '', [{ tipo_atividade: 'Monitoria', horas_brutas: 2.0, evidencia_url: 'http://link.com' }]);
    expect(error).toBe('Relatório Proex em formato PDF é obrigatório');
  });

  it('deve invalidar submissões com horas brutas negativas ou zero', () => {
    const error = validateWeeklySubmission('2026-W28', 'relatorio.pdf', [{ tipo_atividade: 'Monitoria', horas_brutas: 0.0, evidencia_url: 'http://link.com' }]);
    expect(error).toBe('Horas brutas devem ser maiores que zero');
  });

  it('deve validar com sucesso submissões corretas', () => {
    const error = validateWeeklySubmission('2026-W28', 'relatorio.pdf', [{ tipo_atividade: 'Monitoria', horas_brutas: 4.0, evidencia_url: 'http://link.com' }]);
    expect(error).toBeNull();
  });
});
