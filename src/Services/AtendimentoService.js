import { AtendimentoRepository } from '../repositories/AtendimentoRepository.js';
import { BeneficioRepository } from '../repositories/BeneficioRepository.js';
import { AgendamentoRepository } from '../repositories/AgendamentoRepository.js';
import { ElegibilidadeService } from './ElegibilidadeService.js';

export class AtendimentoService {
  constructor() {
    this.atendimentoRepo = new AtendimentoRepository();
    this.beneficioRepo = new BeneficioRepository();
    this.agendamentoRepo = new AgendamentoRepository();
    this.elegibilidadeService = new ElegibilidadeService();
  }

  async iniciarAtendimento() {
    return this.atendimentoRepo.criar();
  }

  async buscarAtendimento(id) {
    const atendimento = await this.atendimentoRepo.buscarPorId(id);
    if (!atendimento) {
      throw new Error('Atendimento nao encontrado');
    }
    return atendimento;
  }

  async salvarDadosFamilia(id, dados) {
    await this.buscarAtendimento(id);
    await this.atendimentoRepo.atualizarDadosFamilia(id, dados);

    const beneficios = await this.elegibilidadeService.calcularBeneficiosElegiveis(dados);
    await this.atendimentoRepo.salvarBeneficiosElegiveis(
      id,
      beneficios.map((beneficio) => beneficio.id),
    );

    return beneficios;
  }

  async selecionarBeneficios(id, beneficioIds) {
    await this.buscarAtendimento(id);
    await this.atendimentoRepo.selecionarBeneficios(id, beneficioIds);
  }

  async buscarBeneficiosElegiveis(id) {
    await this.buscarAtendimento(id);
    return this.beneficioRepo.buscarBeneficiosAtendimento(id);
  }

  async realizarAgendamento(id, dados) {
    await this.buscarAtendimento(id);
    await this.atendimentoRepo.atualizarDadosPessoais(id, dados.nome_completo, dados.telefone);

    const slots = await this.agendamentoRepo.buscarSlotsDisponiveis(dados.data_agendamento);
    const slot = slots.find((item) => String(item.horario).slice(0, 5) === String(dados.horario).slice(0, 5));

    const agendamento = await this.agendamentoRepo.criarAgendamento({
      atendimento_id: id,
      data_agendamento: dados.data_agendamento,
      horario: dados.horario,
      local: dados.local || slot?.local || 'CRAS',
      endereco: dados.endereco || slot?.endereco || 'Endereco a confirmar',
      status: 'agendado',
    });

    await this.atendimentoRepo.concluir(id);
    return agendamento;
  }

  async buscarSlotsDisponiveis(data) {
    return this.agendamentoRepo.buscarSlotsDisponiveis(data);
  }

  async buscarDatasDisponiveis() {
    return this.agendamentoRepo.buscarDatasDisponiveis();
  }
}
