import { Router } from 'express';
import { AtendimentoController } from '../controllers/AtendimentoController.js';
import { BeneficioController } from '../controllers/BeneficioController.js';

const router = Router();

// ── Benefícios ──────────────────────────────────────────
router.get('/beneficios', BeneficioController.listar);
router.get('/beneficios/faixas-renda', BeneficioController.listarFaixasRenda);

// ── Agendamentos ─────────────────────────────────────────
router.get('/agendamentos/slots', AtendimentoController.buscarSlots);
router.get('/agendamentos/datas', AtendimentoController.buscarDatas);

// ── Atendimentos ──────────────────────────────────────────
router.post('/atendimentos', AtendimentoController.iniciar);
router.get('/atendimentos/:id', AtendimentoController.buscar);
router.put('/atendimentos/:id/familia', AtendimentoController.salvarDadosFamilia);
router.put('/atendimentos/:id/beneficios', AtendimentoController.selecionarBeneficios);
router.get('/atendimentos/:id/beneficios', AtendimentoController.buscarBeneficiosElegiveis);
router.post('/atendimentos/:id/agendar', AtendimentoController.agendar);

export default router;
