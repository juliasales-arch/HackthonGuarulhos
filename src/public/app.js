const state = {
  screen: 0,
  atendimentoId: localStorage.getItem('atendimentoId') || '',
  beneficios: [],
  beneficiosElegiveis: [],
  beneficiosSelecionados: [],
  faixas: [],
  slots: [],
  agendamento: null,
};

const TOTAL_STEPS = 9;

const DOCUMENTOS_PROGRAMAS = {
  bolsaFamilia: {
    titulo: 'Bolsa Familia / Cadastro Unico',
    documentos: [
      'RG ou CPF de todos os membros da familia',
      'Titulo de eleitor',
      'Comprovante de residencia atualizado',
      'Certidao de nascimento ou casamento',
      'Carteira de trabalho',
      'Comprovante de renda, quando houver',
      'Declaracao escolar das criancas e adolescentes',
      'Cartao de vacinacao atualizado das criancas',
    ],
  },
  tarifaSocialEnergia: {
    titulo: 'Tarifa Social de Energia Eletrica',
    documentos: [
      'Numero do NIS (Cadastro Unico)',
      'CPF e RG do responsavel familiar',
      'Conta de energia eletrica',
      'Comprovante de residencia',
      'Laudo medico em casos de uso continuo de aparelhos eletricos',
    ],
  },
  seguroDesemprego: {
    titulo: 'Seguro-Desemprego',
    documentos: [
      'RG e CPF',
      'Carteira de Trabalho',
      'Termo de Rescisao do Contrato de Trabalho',
      'Requerimento do Seguro-Desemprego',
      'Comprovante de saque do FGTS',
      'Extrato do FGTS',
      'Comprovante de residencia',
    ],
  },
  bpcLoas: {
    titulo: 'Beneficio de Prestacao Continuada (BPC/LOAS)',
    documentos: [
      'CPF de todos os membros da familia',
      'RG do solicitante',
      'Cadastro Unico atualizado',
      'Comprovante de residencia',
      'Laudos medicos e exames para pessoa com deficiencia',
      'Comprovantes de renda familiar',
    ],
  },
  passeLivre: {
    titulo: 'Passe Livre para Idosos e Pessoas com Deficiencia',
    documentos: [
      'RG e CPF',
      'Foto 3x4',
      'Comprovante de residencia',
      'Laudo medico atualizado',
      'Comprovante de renda familiar',
    ],
  },
  auxilioGas: {
    titulo: 'Auxilio Gas',
    documentos: ['CPF e RG', 'Numero do NIS', 'Cadastro Unico atualizado', 'Comprovante de residencia'],
  },
  geral: {
    titulo: 'Documentos gerais para atendimento no CRAS',
    documentos: [
      'RG e CPF do solicitante',
      'Comprovante de residencia atualizado',
      'Comprovante de renda familiar, quando houver',
      'Cadastro Unico atualizado, se possuir',
      'Documentos dos membros da familia',
    ],
  },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function setOutput(data) {
  console.debug('Resposta da API:', data);
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  setOutput(data);
  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Erro ${response.status}`);
  }
  return data;
}

function normalizarTexto(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function documentoParaBeneficio(beneficio) {
  const nome = normalizarTexto(beneficio.nome);
  if (nome.includes('bolsa familia')) return DOCUMENTOS_PROGRAMAS.bolsaFamilia;
  if (nome.includes('energia eletrica')) return DOCUMENTOS_PROGRAMAS.tarifaSocialEnergia;
  if (nome.includes('seguro desemprego')) return DOCUMENTOS_PROGRAMAS.seguroDesemprego;
  if (nome.includes('bpc') || nome.includes('loas')) return DOCUMENTOS_PROGRAMAS.bpcLoas;
  if (nome.includes('carteira da pessoa idosa')) return DOCUMENTOS_PROGRAMAS.passeLivre;
  if (nome.includes('auxilio gas')) return DOCUMENTOS_PROGRAMAS.auxilioGas;
  return {
    ...DOCUMENTOS_PROGRAMAS.geral,
    titulo: `${beneficio.nome} - documentos gerais`,
    observacao: 'Confirme as exigencias atualizadas com o CRAS ou orgao responsavel.',
  };
}

function checkedValues(name) {
  return $$(`input[name="${name}"]:checked`).map((input) => input.value);
}

function normalizeDate(value) {
  return value ? String(value).slice(0, 10) : '';
}

function normalizeTime(value) {
  return value ? String(value).slice(0, 5) : '';
}

function formatDate(value) {
  const normalized = normalizeDate(value);
  return normalized ? normalized.split('-').reverse().join('/') : '';
}

function monthLabel(date) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
}

function renderCalendar(datas = []) {
  const selectedDate = $('#dataAgendamento')?.value || normalizeDate(datas[0]);
  const availableDates = new Set(datas.map(normalizeDate));
  const base = selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date();
  const year = base.getFullYear();
  const month = base.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const days = [];

  for (let i = 0; i < startOffset; i += 1) {
    days.push({ label: '', className: 'muted-day' });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const value = date.toISOString().slice(0, 10);
    const classes = [];
    if (value === selectedDate) classes.push('active-day');
    else if (availableDates.has(value)) classes.push('available-day');
    days.push({ label: day, className: classes.join(' ') });
  }

  $('#calendarMonth').textContent = monthLabel(base);
  $('#calendarDays').innerHTML = days
    .slice(0, 35)
    .map((day) => `<span class="${day.className}">${day.label}</span>`)
    .join('');
}

function setScreen(nextScreen) {
  state.screen = Math.max(0, Math.min(TOTAL_STEPS, nextScreen));
  $$('.screen').forEach((screen) => {
    screen.classList.toggle('active', Number(screen.dataset.screen) === state.screen);
  });

  $('#progressFill').style.width = `${(state.screen / TOTAL_STEPS) * 100}%`;
  $('#btnVoltar').style.visibility = state.screen <= 1 ? 'hidden' : 'visible';
  $('#btnContinuar').style.display = state.screen === 9 ? 'none' : 'inline-flex';
  $('.nav-bar').style.display = state.screen === 0 || state.screen === 9 ? 'none' : 'grid';
}

function getQtdPessoas() {
  return Number($('#qtdPessoasValue').textContent || 1);
}

function setQtdPessoas(value) {
  $('#qtdPessoasValue').textContent = String(Math.max(1, value));
}

function getSelectedIncome() {
  const selected = $('input[name="faixaRenda"]:checked');
  return selected ? Number(selected.value) : 0;
}

function renderFaixas() {
  const container = $('#incomeOptions');
  container.innerHTML = '';
  state.faixas.forEach((faixa, index) => {
    const label = document.createElement('label');
    label.className = 'option-row';
    label.innerHTML = `
      <input type="radio" name="faixaRenda" value="${faixa.id}" ${index === 0 ? 'checked' : ''} />
      ${faixa.nome}
    `;
    container.appendChild(label);
  });
}

function renderDatas(datas) {
  const select = $('#dataAgendamento');
  select.innerHTML = '<option value="">Selecione uma data</option>';
  datas.forEach((data) => {
    const value = normalizeDate(data);
    const option = document.createElement('option');
    option.value = value;
    option.textContent = formatDate(value);
    select.appendChild(option);
  });
  if (datas[0]) {
    select.value = normalizeDate(datas[0]);
  }
  renderCalendar(datas);
}

function renderSlots() {
  const horarioSelect = $('#horarioAgendamento');
  const slotsLista = $('#slotsLista');
  horarioSelect.innerHTML = '<option value="">Selecione um horario</option>';
  slotsLista.innerHTML = '';

  if (!state.slots.length) {
    slotsLista.innerHTML = '<div class="slot-card">Nenhum horário disponível para esta data.</div>';
    return;
  }

  state.slots.forEach((slot) => {
    const horario = normalizeTime(slot.horario);
    const option = document.createElement('option');
    option.value = horario;
    option.textContent = `${horario} - ${slot.local}`;
    horarioSelect.appendChild(option);

    const card = document.createElement('article');
    card.className = 'slot-card';
    card.innerHTML = `<strong>${horario} - ${slot.local}</strong><p>${slot.endereco}</p><p>${slot.vagas_disponiveis} vaga(s) disponiveis</p>`;
    slotsLista.appendChild(card);
  });

  horarioSelect.value = normalizeTime(state.slots[0]?.horario);
}

function renderBeneficios() {
  const container = $('#beneficiosLista');
  container.innerHTML = '';

  if (!state.beneficiosElegiveis.length) {
    container.innerHTML = '<div class="benefit-card">Nenhum benefício elegível retornado para este perfil.</div>';
    return;
  }

  state.beneficiosElegiveis.forEach((beneficio) => {
    const card = document.createElement('article');
    card.className = 'benefit-card';
    card.innerHTML = `
      <label>
        <input type="checkbox" name="beneficioSelecionado" value="${beneficio.id}" checked />
        <strong>${beneficio.nome}</strong>
      </label>
    `;
    container.appendChild(card);
  });
}

function renderDocumentos() {
  const container = $('#documentosLista');
  const selecionados = state.beneficiosSelecionados.length
    ? state.beneficiosSelecionados
    : state.beneficiosElegiveis;
  container.innerHTML = '';

  const documentosUnicos = new Map();
  selecionados.forEach((beneficio) => {
    const doc = documentoParaBeneficio(beneficio);
    documentosUnicos.set(doc.titulo, doc);
  });

  if (!documentosUnicos.size) {
    documentosUnicos.set(DOCUMENTOS_PROGRAMAS.geral.titulo, DOCUMENTOS_PROGRAMAS.geral);
  }

  documentosUnicos.forEach((doc) => {
    const card = document.createElement('article');
    card.className = 'document-card';
    const itens = doc.documentos.map((item) => `<li>${item}</li>`).join('');
    card.innerHTML = `<h3>${doc.titulo}</h3><ul>${itens}</ul>${doc.observacao ? `<p class="document-note">${doc.observacao}</p>` : ''}`;
    container.appendChild(card);
  });
}

function renderResumoAgendamento() {
  const slot = state.slots.find((item) => normalizeTime(item.horario) === $('#horarioAgendamento').value);
  $('#agendamentoResumo').innerHTML = `
    <strong>Unidade:</strong><span>${slot?.local || state.agendamento?.local || 'CRAS'}</span>
    <strong>Data:</strong><span>${formatDate($('#dataAgendamento').value)}</span>
    <strong>Horário:</strong><span>${$('#horarioAgendamento').value}</span>
  `;
}

async function checkHealth() {
  try {
    await api('/health');
    $('#apiStatusDot').className = 'status-dot ok';
    $('#apiStatusText').textContent = 'Online';
  } catch (error) {
    $('#apiStatusDot').className = 'status-dot error';
    $('#apiStatusText').textContent = 'Offline';
  }
}

async function carregarBase() {
  const [beneficios, faixas, datas] = await Promise.all([
    api('/api/beneficios'),
    api('/api/beneficios/faixas-renda'),
    api('/api/agendamentos/datas'),
  ]);

  state.beneficios = beneficios.data || [];
  state.faixas = faixas.data || [];
  renderFaixas();
  renderDatas(datas.data || []);
  if ($('#dataAgendamento').value) {
    await carregarSlots();
  }
}

async function criarAtendimento() {
  const data = await api('/api/atendimentos', { method: 'POST', body: '{}' });
  state.atendimentoId = data.data.id;
  localStorage.setItem('atendimentoId', state.atendimentoId);
}

async function salvarFamilia() {
  const payload = {
    faixa_renda_id: getSelectedIncome(),
    qtd_pessoas: getQtdPessoas(),
    faixa_etaria_0_5: Number($('#faixa0a5').value),
    faixa_etaria_6_17: Number($('#faixa6a17').value),
    faixa_etaria_18_59: Number($('#faixa18a59').value),
    faixa_etaria_60_mais: Number($('#faixa60mais').value),
    condicoes_familia: checkedValues('condicao'),
    beneficios_atuais: checkedValues('beneficioAtual'),
  };

  if (!payload.faixa_renda_id) {
    throw new Error('Selecione uma faixa de renda.');
  }

  const data = await api(`/api/atendimentos/${state.atendimentoId}/familia`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  state.beneficiosElegiveis = data.data?.beneficios_elegiveis || [];
  state.beneficiosSelecionados = [...state.beneficiosElegiveis];
  renderBeneficios();
}

async function selecionarBeneficios() {
  const beneficioIds = checkedValues('beneficioSelecionado').map(Number);
  await api(`/api/atendimentos/${state.atendimentoId}/beneficios`, {
    method: 'PUT',
    body: JSON.stringify({ beneficio_ids: beneficioIds }),
  });
  state.beneficiosSelecionados = state.beneficios.filter((beneficio) =>
    beneficioIds.includes(Number(beneficio.id)),
  );
}

async function carregarSlots() {
  const data = $('#dataAgendamento').value;
  const result = await api(`/api/agendamentos/slots?data=${encodeURIComponent(data)}`);
  state.slots = result.data || [];
  renderSlots();
}

async function agendar() {
  const payload = {
    nome_completo: $('#nomeCompleto').value.trim(),
    telefone: $('#telefone').value.trim(),
    data_agendamento: $('#dataAgendamento').value,
    horario: $('#horarioAgendamento').value,
  };

  if (!payload.nome_completo || !payload.telefone || !payload.data_agendamento || !payload.horario) {
    throw new Error('Preencha nome, telefone, data e horário.');
  }

  const data = await api(`/api/atendimentos/${state.atendimentoId}/agendar`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  state.agendamento = data.data;
  renderResumoAgendamento();
  renderDocumentos();
}

async function handleNext() {
  try {
    if (state.screen === 0) {
      await criarAtendimento();
      setScreen(1);
      return;
    }
    if (state.screen === 5) {
      await salvarFamilia();
      setScreen(6);
      return;
    }
    if (state.screen === 6) {
      await selecionarBeneficios();
      setScreen(7);
      return;
    }
    if (state.screen === 8) {
      await agendar();
      setScreen(9);
      return;
    }
    setScreen(state.screen + 1);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function bindEvents() {
  $('#btnComecar').addEventListener('click', handleNext);
  $('#btnContinuar').addEventListener('click', handleNext);
  $('#btnVoltar').addEventListener('click', () => setScreen(state.screen - 1));
  $('#btnReiniciar').addEventListener('click', () => {
    state.atendimentoId = '';
    state.beneficiosElegiveis = [];
    state.beneficiosSelecionados = [];
    state.agendamento = null;
    localStorage.removeItem('atendimentoId');
    setScreen(0);
  });
  $('#btnImprimirDocumentos').addEventListener('click', () => window.print());
  $('#dataAgendamento').addEventListener('change', () => {
    renderCalendar([$('#dataAgendamento').value, ...state.slots.map((slot) => slot.data)]);
    carregarSlots().catch((error) => showToast(error.message, 'error'));
  });
  $$('[data-action="inc"]').forEach((button) =>
    button.addEventListener('click', () => setQtdPessoas(getQtdPessoas() + 1)),
  );
  $$('[data-action="dec"]').forEach((button) =>
    button.addEventListener('click', () => setQtdPessoas(getQtdPessoas() - 1)),
  );
  $('#btnMic').addEventListener('click', () => showToast('Entrada por voz ilustrativa neste prototipo.'));
}

async function init() {
  bindEvents();
  setScreen(0);
  await checkHealth();
  try {
    await carregarBase();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

init();
