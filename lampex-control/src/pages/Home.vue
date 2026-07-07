<script setup lang="ts">
import TutoringRequestForm from '../components/TutoringRequestForm.vue';
</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr; gap: 3rem; align-items: start; padding-top: 1rem;">
    <!-- Banner Hero Expositivo -->
    <div class="glass-card" style="padding: 3rem; text-align: center; border-color: var(--border-color);">
      <h1 style="font-size: 3rem; line-height: 1.1; margin-bottom: 1.5rem; font-weight: 800; color: var(--color-primary);">
        Laboratório Modelo de Práticas de Extensão
      </h1>
      <p style="font-size: 1.25rem; color: var(--text-secondary); max-width: 800px; margin: 0 auto 2rem auto; font-family: var(--font-body);">
        O **LAMPEX** (Ifes campus Serra) apoia estudantes e a comunidade externa por meio de monitorias acadêmicas personalizadas, minicursos práticos e desenvolvimento de software institucional.
      </p>
      
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <a href="#solicitar" class="btn-primary">Solicitar Monitoria Agora</a>
        <router-link :to="{ name: 'RequestStatus' }" class="btn-secondary">Acompanhar Protocolo</router-link>
      </div>
    </div>

    <!-- Seção de Serviços e o Formulário de Monitoria -->
    <div id="solicitar" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div class="glass-card">
          <span style="font-size: 0.8rem; color: var(--color-primary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Serviço</span>
          <h2 style="color: var(--text-primary); font-size: 1.75rem; margin-top: 0.25rem; margin-bottom: 1rem;">Como funciona o atendimento?</h2>
          <p style="color: var(--text-secondary); margin-bottom: 1rem;">
            Nossos monitores são voluntários e bolsistas dedicados a ajudar você a resolver suas dúvidas em disciplinas técnicas e práticas de extensão.
          </p>
          <ul style="color: var(--text-secondary); padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <li><strong>Presencial:</strong> Alocação física na sala 918S ou laboratórios do campus.</li>
            <li><strong>Online:</strong> Salas exclusivas no Discord, Teams ou Google Meet.</li>
            <li><strong>Certificação:</strong> Todos os atendimentos geram registro seguro atrelado ao seu CPF.</li>
          </ul>
        </div>

        <div class="glass-card" style="border-color: var(--border-color);">
          <span style="font-size: 0.8rem; color: var(--color-primary-dark); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Para Monitores</span>
          <h2 style="color: var(--text-primary); font-size: 1.5rem; margin-top: 0.25rem; margin-bottom: 0.75rem;">Área de Trabalho</h2>
          <p style="color: var(--text-secondary); margin-bottom: 1rem;">
            Se você é voluntário ou bolsista do LAMPEX, acesse sua conta para preencher sua grade de horários, atualizar opções de privacidade ou enviar relatórios de horas.
          </p>
          <router-link :to="{ name: 'Login' }" class="btn-secondary" style="width: fit-content;">Acessar Área do Monitor</router-link>
        </div>
      </div>

      <!-- Renderização do Componente de Formulário -->
      <TutoringRequestForm />
    </div>
  </div>
</template>
