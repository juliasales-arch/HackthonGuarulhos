import { query } from '../config/database.js';

export class AgendamentoRepository {
  async buscarSlotsDisponiveis(data) {
    const params = [];
    let whereData = '';

    if (data) {
      params.push(data);
      whereData = `AND data = $${params.length}`;
    }

    const result = await query(
      `
        SELECT
          *,
          (vagas_total - vagas_ocupadas) AS vagas_disponiveis
        FROM slots_agendamento
        WHERE ativo = TRUE
          AND (vagas_total - vagas_ocupadas) > 0
          AND data >= CURRENT_DATE
          ${whereData}
        ORDER BY data, horario
      `,
      params,
    );

    return result.rows;
  }

  async buscarDatasDisponiveis() {
    const result = await query(`
      SELECT DISTINCT data
      FROM slots_agendamento
      WHERE ativo = TRUE
        AND (vagas_total - vagas_ocupadas) > 0
        AND data >= CURRENT_DATE
      ORDER BY data
      LIMIT 30
    `);
    return result.rows.map((row) => row.data);
  }

  async criarAgendamento(agendamento) {
    const slotResult = await query(
      `
        SELECT *
        FROM slots_agendamento
        WHERE data = $1
          AND horario = $2
          AND ativo = TRUE
          AND (vagas_total - vagas_ocupadas) > 0
        LIMIT 1
      `,
      [agendamento.data_agendamento, agendamento.horario],
    );

    const slot = slotResult.rows[0];
    if (!slot) {
      throw new Error('Horario nao disponivel');
    }

    const result = await query(
      `
        INSERT INTO agendamentos (atendimento_id, data_agendamento, horario, local, endereco, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        agendamento.atendimento_id,
        agendamento.data_agendamento,
        agendamento.horario,
        agendamento.local || slot.local,
        agendamento.endereco || slot.endereco,
        agendamento.status || 'agendado',
      ],
    );

    await query(
      `
        UPDATE slots_agendamento
        SET vagas_ocupadas = vagas_ocupadas + 1
        WHERE data = $1 AND horario = $2
      `,
      [agendamento.data_agendamento, agendamento.horario],
    );

    return result.rows[0];
  }

  async buscarPorAtendimento(atendimentoId) {
    const result = await query(
      `
        SELECT *
        FROM agendamentos
        WHERE atendimento_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [atendimentoId],
    );
    return result.rows[0];
  }
}
