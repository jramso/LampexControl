import { describe, it, expect, vi } from 'vitest';

// Simulação simplificada da lógica de visibilidade condicional de privacidade (FR-003, FR-010)
function getVisibleContact(
  statusAgendamento: string,
  permiteExibirContato: boolean,
  plataformaContato: string,
  telefoneMonitor: string
) {
  if (statusAgendamento !== 'Confirmado') {
    return null;
  }
  if (!permiteExibirContato) {
    return 'Contato ocultado pelo monitor';
  }
  return plataformaContato === 'WhatsApp' ? `WhatsApp: ${telefoneMonitor}` : plataformaContato;
}

describe('User Story 1 - Privacidade e Agendamento de Monitorias', () => {
  it('deve ocultar contato se o agendamento não estiver confirmado', () => {
    const contact = getVisibleContact('Pendente', true, 'WhatsApp', '27999999999');
    expect(contact).toBeNull();
  });

  it('deve ocultar contato se o agendamento estiver confirmado mas o monitor desativou a exibição', () => {
    const contact = getVisibleContact('Confirmado', false, 'WhatsApp', '27999999999');
    expect(contact).toBe('Contato ocultado pelo monitor');
  });

  it('deve mostrar WhatsApp do monitor se o agendamento estiver confirmado e o monitor permitiu exibição', () => {
    const contact = getVisibleContact('Confirmado', true, 'WhatsApp', '27999999999');
    expect(contact).toBe('WhatsApp: 27999999999');
  });
});
