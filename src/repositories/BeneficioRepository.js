import { query } from '../config/database.js';

export class BeneficioRepository {
  async listarTodos() {
    const result = await query('SELECT * FROM beneficios WHERE ativo = TRUE ORDER BY id');
    return result.rows;
  }

  async listarFaixasRenda() {
    const result = await query('SELECT * FROM faixas_renda WHERE ativo = TRUE ORDER BY id');
    return result.rows;
  }

  async buscarPorId(id) {
    const result = await query('SELECT * FROM beneficios WHERE id = $1', [id]);
    return result.rows[0];
  }

  async buscarBeneficiosAtendimento(atendimentoId) {
    const result = await query(
      `
        SELECT b.*
        FROM beneficios b
        INNER JOIN atendimento_beneficios ab ON b.id = ab.beneficio_id
        WHERE ab.atendimento_id = $1
        ORDER BY b.id
      `,
      [atendimentoId],
    );
    return result.rows;
  }

  async buscarBeneficiosSelecionados(atendimentoId) {
    const result = await query(
      `
        SELECT b.*
        FROM beneficios b
        INNER JOIN atendimento_beneficios ab ON b.id = ab.beneficio_id
        WHERE ab.atendimento_id = $1 AND ab.selecionado = TRUE
        ORDER BY b.id
      `,
      [atendimentoId],
    );
    return result.rows;
  }
}
