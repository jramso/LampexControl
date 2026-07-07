<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '../services/apiClient';

const emit = defineEmits(['audited']);

const submissions = ref<any[]>([]);
const selectedSub = ref<any>(null);
const isLoading = ref(true);
const auditJustification = ref('');
const isSubmitting = ref(false);

const fetchSubmissions = async () => {
  isLoading.value = true;
  selectedSub.value = null;
  try {
    // Buscar registros semanais pendentes (não aprovados/recusados no histórico de auditoria)
    // No PostgREST, podemos buscar os registros semanais com seus itens de atividade
    const { data, error } = await apiClient
      .from('registro_semanal')
      .select('*, monitor(nome), item_atividade(*)');

    if (!error && data) {
      // Como o PostgREST não faz join de tabelas distantes nativamente de forma simples na mesma query sem view,
      // nós buscamos e filtramos no cliente para simplificar.
      // E filtramos por registros que não possuam auditorias ativas (ou buscamos apenas os pendentes).
      // Para fins de demonstração robusta, buscamos todos e filtramos os que têm auditoria.
      const { data: auditData } = await apiClient.from('historico_auditoria').select('registro_semanal_id');
      const auditedIds = (auditData || []).map(a => a.registro_semanal_id);
      
      submissions.value = data.filter(sub => !auditedIds.includes(sub.id));
      if (submissions.value.length > 0) {
        selectedSub.value = submissions.value[0];
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchSubmissions);

const calculateLiquidas = (tipo: string, brutas: number, url: string) => {
  const h = Number(brutas || 0);
  if (tipo === 'Outros' && url.toLowerCase().includes('planejamento')) {
    return 0;
  }
  switch (tipo) {
    case 'Monitoria': return h * 2.0;
    case 'Minicurso com Material': return h * 3.0;
    case 'Minicurso sem Material': return h * 2.5;
    case 'Marketing Digital': return h === 1.0 ? 2.0 : 4.0;
    default: return h;
  }
};

const handleAudit = async (status: 'Aprovado' | 'Recusado') => {
  if (!selectedSub.value) return;
  if (status === 'Recusado' && !auditJustification.value) {
    alert('Por favor, informe uma justificativa para recusar o registro.');
    return;
  }

  isSubmitting.value = true;
  const gestorId = localStorage.getItem('lampex_user_id');

  try {
    const { error } = await apiClient
      .from('historico_auditoria')
      .insert({
        registro_semanal_id: selectedSub.value.id,
        gestor_id: gestorId,
        status_auditoria: status,
        justificativa: auditJustification.value || 'Aprovado via painel de coordenação.'
      });

    if (error) {
      alert(`Erro ao registrar auditoria: ${error.message}`);
    } else {
      alert(`Registro de horas ${status.toLowerCase()} com sucesso!`);
      auditJustification.value = '';
      emit('audited');
      await fetchSubmissions();
    }
  } catch (err) {
    console.error(err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
    <!-- Lista & Detalhes das Submissões -->
    <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.5rem;">
      <h3 style="color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
        Fila de Auditoria de Horas
      </h3>

      <div v-if="isLoading" style="color: var(--text-secondary); text-align: center; padding: 2rem;">
        Carregando fila de relatórios...
      </div>

      <template v-else>
        <div v-if="submissions.length === 0" style="color: var(--text-muted); text-align: center; padding: 2rem;">
          Nenhum relatório pendente de auditoria no momento.
        </div>

        <template v-else>
          <!-- Seletor de Submissões -->
          <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem;">
            <button 
              v-for="sub in submissions" 
              :key="sub.id"
              @click="selectedSub = sub"
              class="btn-secondary"
              :style="{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                borderColor: selectedSub?.id === sub.id ? 'var(--accent-cyan)' : 'var(--border-color)',
                color: selectedSub?.id === sub.id ? 'var(--accent-cyan)' : 'var(--text-primary)'
              }"
            >
              {{ sub.monitor?.nome?.split(' ')[0] }} - {{ new Date(sub.semana_referencia).toLocaleDateString() }}
            </button>
          </div>

          <!-- Detalhes do Registro Selecionado -->
          <div v-if="selectedSub" style="display: flex; flex-direction: column; gap: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <span style="font-size: 0.8rem; color: var(--text-secondary);">Monitor</span>
                <h4 style="color: var(--text-primary);">{{ selectedSub.monitor?.nome }}</h4>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.8rem; color: var(--text-secondary);">Semana de Ref.</span>
                <p style="color: var(--text-primary); font-weight: 500;">{{ new Date(selectedSub.semana_referencia).toLocaleDateString() }}</p>
              </div>
            </div>

            <!-- Lista de Atividades do Registro -->
            <div>
              <h4 style="color: var(--text-primary); font-size: 0.9rem; margin-bottom: 0.5rem;">Atividades Praticadas</h4>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div 
                  v-for="act in selectedSub.item_atividade" 
                  :key="act.id"
                  style="background: var(--bg-tertiary); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;"
                >
                  <div>
                    <strong style="color: var(--text-primary); font-size: 0.9rem; display: block;">{{ act.tipo_atividade }}</strong>
                    <a :href="act.evidencia_url" target="_blank" style="color: var(--accent-cyan); font-size: 0.75rem; text-decoration: none;">
                      Link de Evidência ↗
                    </a>
                  </div>
                  <div style="text-align: right;">
                    <span style="display: block; font-size: 0.9rem; color: var(--text-primary); font-weight: 600;">
                      {{ calculateLiquidas(act.tipo_atividade, act.horas_brutas, act.evidencia_url).toFixed(1) }}h líq
                    </span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary);">
                      Bruto: {{ Number(act.horas_brutas).toFixed(1) }}h
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Caixa de Auditoria / Ações -->
            <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
              <label class="form-label">Justificativa da Auditoria</label>
              <textarea 
                v-model="auditJustification" 
                class="form-textarea" 
                rows="2" 
                placeholder="Insira a justificativa ou observações sobre a validação"
              ></textarea>
              
              <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                <button 
                  @click="handleAudit('Aprovado')" 
                  class="btn-primary" 
                  style="flex: 1; justify-content: center; background: var(--accent-green);"
                  :disabled="isSubmitting"
                >
                  Aprovar Horas
                </button>
                <button 
                  @click="handleAudit('Recusado')" 
                  class="btn-secondary" 
                  style="flex: 1; justify-content: center; color: var(--accent-red); border-color: var(--accent-red);"
                  :disabled="isSubmitting"
                >
                  Recusar Registro
                </button>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>

    <!-- Visualização Lateral Side-by-Side (PDF do Relatório) -->
    <div class="glass-card" style="height: 600px; display: flex; flex-direction: column;">
      <h3 style="color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">
        Visualização do Relatório Proex (PDF)
      </h3>
      
      <div v-if="selectedSub" style="flex: 1; border-radius: var(--radius-md); overflow: hidden; background: var(--bg-secondary); border: 1px solid var(--border-color);">
        <!-- Incorporação segura de PDF em Iframe -->
        <iframe 
          :src="selectedSub.arquivo_pdf_url" 
          style="width: 100%; height: 100%; border: none;"
          title="Relatório Proex Monitor"
        ></iframe>
      </div>
      
      <div v-else style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-style: italic;">
        Selecione um monitor na lista para visualizar o PDF do relatório.
      </div>
    </div>
  </div>
</template>
