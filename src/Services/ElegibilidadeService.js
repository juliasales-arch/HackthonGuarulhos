import { BeneficioRepository } from '../repositories/BeneficioRepository.js';

export class ElegibilidadeService {
  constructor() {
    this.beneficioRepo = new BeneficioRepository();
  }

  async calcularBeneficiosElegiveis(dados) {
    const todosBeneficios = await this.beneficioRepo.listarTodos();
    return todosBeneficios.filter((beneficio) => this.verificarElegibilidade(beneficio, dados));
  }

  verificarElegibilidade(beneficio, dados) {
    const condicoes = dados.condicoes_familia || [];
    const faixaRenda = dados.faixa_renda_id;

    const rendaBaixa = [1, 2, 4].includes(faixaRenda);
    const rendaMuitoBaixa = [1, 4].includes(faixaRenda);
    const temIdoso = dados.faixa_etaria_60_mais > 0 || condicoes.includes('idoso');
    const temCrianca = dados.faixa_etaria_0_5 > 0 || dados.faixa_etaria_6_17 > 0;
    const temJovem = dados.faixa_etaria_6_17 > 0;
    const temDeficiente = condicoes.includes('deficiencia');
    const temGestante = condicoes.includes('gestante');

    switch (beneficio.nome) {
      case 'Bolsa Familia':
        return rendaBaixa;
      case 'Tarifa Social de Energia Eletrica':
        return rendaBaixa;
      case 'Tarifa Social de Agua e Esgoto':
        return rendaBaixa;
      case 'ID Jovem':
        return temJovem && rendaBaixa;
      case 'Carteira da Pessoa Idosa':
        return temIdoso && rendaBaixa;
      case 'Viva Leite':
        return (temCrianca || temGestante) && rendaBaixa;
      case 'BPC / LOAS':
        return (temIdoso || temDeficiente) && rendaMuitoBaixa;
      case 'Seguro Desemprego':
        return dados.faixa_etaria_18_59 > 0;
      case 'Auxilio Doenca':
        return condicoes.includes('doenca') || temDeficiente;
      default:
        return false;
    }
  }
}
