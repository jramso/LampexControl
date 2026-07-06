import { describe, it, expect } from 'vitest';

// Simulação da agregação do mapa de calor de reuniões (FR-008, SC-004)
function aggregateHeatmap(monitorsDisponibilidade: any[]) {
  const days = ['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira'];
  const blocks = ['Matutino', 'Vespertino', 'Noturno'];
  const result: any[] = [];

  days.forEach(day => {
    blocks.forEach(block => {
      let pesoTotal = 0;
      monitorsDisponibilidade.forEach(m => {
        const peso = m.matriz_disponibilidade?.[day]?.[block] || 0.0;
        pesoTotal += peso;
      });
      result.push({
        dia_semana: day,
        bloco_horario: block,
        peso_total: pesoTotal
      });
    });
  });

  return result;
}

describe('User Story 3 - Painel de Gestão e Mapa de Calor', () => {
  it('deve calcular corretamente a soma ponderada de disponibilidade dos monitores', () => {
    const monitor1 = {
      matriz_disponibilidade: {
        'Segunda-Feira': { 'Matutino': 1.0, 'Vespertino': 0.0, 'Noturno': 0.5 }
      }
    };
    const monitor2 = {
      matriz_disponibilidade: {
        'Segunda-Feira': { 'Matutino': 0.5, 'Vespertino': 1.0, 'Noturno': 0.5 }
      }
    };

    const heatmap = aggregateHeatmap([monitor1, monitor2]);
    const mondayMatutino = heatmap.find(h => h.dia_semana === 'Segunda-Feira' && h.bloco_horario === 'Matutino');
    const mondayVespertino = heatmap.find(h => h.dia_semana === 'Segunda-Feira' && h.bloco_horario === 'Vespertino');
    const mondayNoturno = heatmap.find(h => h.dia_semana === 'Segunda-Feira' && h.bloco_horario === 'Noturno');

    expect(mondayMatutino.peso_total).toBe(1.5);
    expect(mondayVespertino.peso_total).toBe(1.0);
    expect(mondayNoturno.peso_total).toBe(1.0);
  });
});
