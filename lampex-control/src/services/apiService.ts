import { apiClient, getApiUrl } from './apiClient';

export interface TutoringRequestPayload {
  nome_aluno: string;
  email_aluno: string;
  telefone_aluno: string;
  cpf_aluno: string;
  descricao_duvida: string;
  formato: 'Presencial' | 'Online';
  horarios_disponiveis: {
    dia: string;
    bloco: string;
  };
}

export interface WeeklyReportPayload {
  semana_ref: string;
  pdf_url: string | null;
  atividades: Array<{
    tipo_atividade: string;
    horas_brutas: number;
    evidencia_url: string;
  }>;
}

// Helper para tratar erros da API e traduzir rate-limiting (T015)
function handleApiError(error: any): never {
  if (error && error.message && error.message.includes('rate_limit_exceeded')) {
    error.message = 'Limite de requisições excedido. Tente novamente mais tarde.';
  }
  throw error;
}

// 1. Cadastrar Solicitação de Monitoria (POST /solicitacoes_monitoria)
export async function createTutoringRequest(payload: TutoringRequestPayload) {
  const { data, error } = await apiClient
    .from('solicitacoes_monitoria')
    .insert({
      nome_aluno: payload.nome_aluno,
      email_aluno: payload.email_aluno,
      telefone_aluno: payload.telefone_aluno,
      cpf_aluno: payload.cpf_aluno,
      descricao_duvida: payload.descricao_duvida,
      formato: payload.formato,
      horarios_disponiveis: payload.horarios_disponiveis,
      status: 'Pendente'
    })
    .select()
    .single();

  if (error) handleApiError(error);
  return data;
}

// 2. Submeter Registro de Horas Consolidado em Lote (POST /rpc/registro_horas)
export async function submitWeeklyReport(payload: WeeklyReportPayload) {
  const { data, error } = await apiClient.rpc('registro_horas', {
    semana_ref: payload.semana_ref,
    pdf_url: payload.pdf_url,
    atividades: payload.atividades
  });

  if (error) handleApiError(error);
  return data;
}

// 3. Obter Mapa de Calor de Reuniões Gerais (GET /view_reuniao_geral)
export async function getGeneralHeatmap() {
  const { data, error } = await apiClient
    .from('view_reuniao_geral')
    .select('*');

  if (error) handleApiError(error);
  return data || [];
}

// 4. Obter Contato Autorizado do Monitor (GET /view_contato_monitor)
export async function getMonitorContact(cpfAluno: string) {
  const { data, error } = await apiClient
    .from('view_contato_monitor')
    .select('*')
    .eq('cpf_aluno', cpfAluno.replace(/\D/g, ''))
    .order('chamado_id', { ascending: false })
    .limit(1);

  if (error) handleApiError(error);
  return data && data.length > 0 ? data[0] : null;
}

// 5. Cadastrar Potencial Voluntário (POST /voluntarios/cadastro)
export interface VolunteerRegistrationPayload {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  curso: string;
  matricula: string;
  origem_cadastro: string;
}

export async function registerVolunteer(payload: VolunteerRegistrationPayload) {
  const response = await fetch(`${getApiUrl()}/voluntarios/cadastro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao realizar cadastro.');
  }
  return data;
}

// 6. Listar Voluntários Pendentes (GET /voluntarios/pendentes)
export async function getPendingVolunteers() {
  const token = localStorage.getItem('lampex_jwt_token');
  const response = await fetch(`${getApiUrl()}/voluntarios/pendentes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao buscar candidatos pendentes.');
  }
  return data;
}

// 7. Aprovar Voluntário (POST /voluntarios/:id/aprovar)
export async function approveVolunteer(id: string) {
  const token = localStorage.getItem('lampex_jwt_token');
  const response = await fetch(`${getApiUrl()}/voluntarios/${id}/aprovar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao aprovar candidato.');
  }
  return data;
}

// 8. Rejeitar Voluntário (POST /voluntarios/:id/rejeitar)
export async function rejectVolunteer(id: string) {
  const token = localStorage.getItem('lampex_jwt_token');
  const response = await fetch(`${getApiUrl()}/voluntarios/${id}/rejeitar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao rejeitar candidato.');
  }
  return data;
}

// 9. Registrar Atendimento via QR Code (POST /atendimentos/registrar)
export interface AttendanceRegistrationPayload {
  monitor_id: string;
  matricula: string;
  nome: string;
  modalidade: 'Presencial' | 'Online';
  local_ou_link: string;
  horas_duracao: number;
}

export async function registerAttendance(payload: AttendanceRegistrationPayload) {
  const response = await fetch(`${getApiUrl()}/atendimentos/registrar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao registrar atendimento.');
  }
  return data;
}

// 10. Obter Relatório de Produtividade dos Monitores (GET /relatorios/monitores)
export async function getMonitorReports(startDate?: string, endDate?: string) {
  const token = localStorage.getItem('lampex_jwt_token');
  const url = new URL(`${getApiUrl()}/relatorios/monitores`);
  if (startDate) url.searchParams.append('start_date', startDate);
  if (endDate) url.searchParams.append('end_date', endDate);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao carregar relatório de monitores.');
  }
  return data;
}

// 11. Obter Relatório de Consumo dos Alunos (GET /relatorios/alunos)
export async function getStudentReports(startDate?: string, endDate?: string) {
  const token = localStorage.getItem('lampex_jwt_token');
  const url = new URL(`${getApiUrl()}/relatorios/alunos`);
  if (startDate) url.searchParams.append('start_date', startDate);
  if (endDate) url.searchParams.append('end_date', endDate);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao carregar relatório de alunos.');
  }
  return data;
}

// 12. Obter lista de monitores (usando apiClient existente)
export async function getActiveMonitors() {
  const { data, error } = await apiClient
    .from('monitor')
    .select('id, nome, matricula')
    .eq('role', 'monitor')
    .order('nome', { ascending: true });

  if (error) throw error;
  return data || [];
}
