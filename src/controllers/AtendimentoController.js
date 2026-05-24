import { AtendimentoService } from '../Services/AtendimentoService.js';

const service = new AtendimentoService();

export const AtendimentoController = {
  async iniciar(_req, res) {
    try {
      const atendimento = await service.iniciarAtendimento();
      res.status(201).json({ success: true, data: atendimento });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async buscar(req, res) {
    try {
      const { id } = req.params;
      const atendimento = await service.buscarAtendimento(id);
      res.json({ success: true, data: atendimento });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async salvarDadosFamilia(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      if (!dados.faixa_renda_id) {
        res.status(400).json({ success: false, message: 'Faixa de renda e obrigatoria' });
        return;
      }

      const beneficios = await service.salvarDadosFamilia(id, dados);
      res.json({ success: true, data: { beneficios_elegiveis: beneficios } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async selecionarBeneficios(req, res) {
    try {
      const { id } = req.params;
      const { beneficio_ids: beneficioIds } = req.body;

      if (!Array.isArray(beneficioIds)) {
        res.status(400).json({ success: false, message: 'beneficio_ids deve ser um array' });
        return;
      }

      await service.selecionarBeneficios(id, beneficioIds);
      res.json({ success: true, message: 'Beneficios selecionados com sucesso' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async buscarBeneficiosElegiveis(req, res) {
    try {
      const { id } = req.params;
      const beneficios = await service.buscarBeneficiosElegiveis(id);
      res.json({ success: true, data: beneficios });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async agendar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      if (!dados.nome_completo || !dados.telefone || !dados.data_agendamento || !dados.horario) {
        res.status(400).json({
          success: false,
          message: 'Nome, telefone, data e horario sao obrigatorios',
        });
        return;
      }

      const agendamento = await service.realizarAgendamento(id, dados);
      res.status(201).json({ success: true, data: agendamento });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async buscarSlots(req, res) {
    try {
      const { data } = req.query;
      const slots = await service.buscarSlotsDisponiveis(data);
      res.json({ success: true, data: slots });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async buscarDatas(_req, res) {
    try {
      const datas = await service.buscarDatasDisponiveis();
      res.json({ success: true, data: datas });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
