import { apiClient } from './apiClient';

export async function exportToSRC() {
  try {
    // 1. Buscar todas as auditorias aprovadas
    const { data: auditData, error: aError } = await apiClient
      .from('historico_auditoria')
      .select('registro_semanal_id')
      .eq('status_auditoria', 'Aprovado');

    if (aError) {
      throw new Error(`Erro ao buscar auditorias: ${aError.message}`);
    }

    if (!auditData || auditData.length === 0) {
      alert('Nenhum registro de horas aprovado para exportar no momento.');
      return;
    }

    const approvedReportIds = auditData.map(a => a.registro_semanal_id);

    // 2. Buscar os relatórios correspondentes, seus monitores e atividades
    const { data: reports, error: rError } = await apiClient
      .from('registro_semanal')
      .select('*, monitor(*), item_atividade(*)')
      .in('id', approvedReportIds);

    if (rError) {
      throw new Error(`Erro ao buscar relatórios: ${rError.message}`);
    }

    if (!reports || reports.length === 0) {
      alert('Nenhum dado de atividades disponível para os registros aprovados.');
      return;
    }

    // 3. Montar as linhas do arquivo CSV compatível com o Excel (formato ponto-e-vírgula)
    const csvRows: string[] = [];
    csvRows.push('Monitor;E-mail Monitor;Tipo de Atividade;Horas Brutas;Horas Liquidas;Link de Evidencia');

    reports.forEach(rep => {
      const monitorNome = rep.monitor?.nome || '';
      const monitorEmail = rep.monitor?.email || '';
      
      const activities = (rep.item_atividade as any[]) || [];
      activities.forEach(act => {
        let hL = Number(act.horas_brutas || 0);
        // Regra de pesos
        if (act.tipo_atividade === 'Monitoria') {
          hL = hL * 2.0;
        } else if (act.tipo_atividade === 'Minicurso com Material') {
          hL = hL * 3.0;
        } else if (act.tipo_atividade === 'Minicurso sem Material') {
          hL = hL * 2.5;
        } else if (act.tipo_atividade === 'Marketing Digital') {
          hL = act.horas_brutas === 1.0 ? 2.0 : 4.0;
        }
        
        // Trava de reuniões de planejamento
        if (act.tipo_atividade === 'Outros' && act.evidencia_url.toLowerCase().includes('planejamento')) {
          hL = 0.0;
        }

        csvRows.push(
          `"${monitorNome}";"${monitorEmail}";"${act.tipo_atividade}";${act.horas_brutas};${hL};"${act.evidencia_url}"`
        );
      });
    });

    // 4. Trigger de download do arquivo CSV
    const csvContent = '\uFEFF' + csvRows.join('\n'); // UTF-8 BOM
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_src_lampex_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err: any) {
    alert(err.message || 'Erro ao exportar relatório.');
  }
}
