import { BeneficioRepository } from '../repositories/BeneficioRepository.js';

const repo = new BeneficioRepository();

export const BeneficioController = {
  async listar(_req, res) {
    try {
      const beneficios = await repo.listarTodos();
      res.json({ success: true, data: beneficios });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async listarFaixasRenda(_req, res) {
    try {
      const faixas = await repo.listarFaixasRenda();
      res.json({ success: true, data: faixas });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
