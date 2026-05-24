import { randomUUID } from 'crypto';
import { query } from '../config/database.js';

export class AtendimentoRepository {
  async criar() {
    const id = randomUUID();
    const result = await query(
      `
        INSERT INTO atendimentos (
          id,
          qtd_pessoas,
          faixa_etaria_0_5,
          faixa_etaria_6_17,
          faixa_etaria_18_59,
          faixa_etaria_60_mais,
          status
        )
        VALUES ($1, 1, 0, 0, 1, 0, 'em_andamento')
        RETURNING *
      `,
      [id],
    );
    return result.rows[0];
  }

  async buscarPorId(id) {
    const result = await query('SELECT * FROM atendimentos WHERE id = $1', [id]);
    return result.rows[0];
  }

  async atualizarDadosFamilia(id, dados) {
    await query(
      `
        UPDATE atendimentos SET
          qtd_pessoas = $1,
          faixa_etaria_0_5 = $2,
          faixa_etaria_6_17 = $3,
          faixa_etaria_18_59 = $4,
          faixa_etaria_60_mais = $5,
          faixa_renda_id = $6,
          condicoes_familia = $7::jsonb,
          beneficios_atuais = $8::jsonb,
          updated_at = NOW()
        WHERE id = $9
      `,
      [
        dados.qtd_pessoas,
        dados.faixa_etaria_0_5,
        dados.faixa_etaria_6_17,
        dados.faixa_etaria_18_59,
        dados.faixa_etaria_60_mais,
        dados.faixa_renda_id,
        JSON.stringify(dados.condicoes_familia || []),
        JSON.stringify(dados.beneficios_atuais || []),
        id,
      ],
    );
  }

  async atualizarDadosPessoais(id, nome, telefone) {
    await query(
      'UPDATE atendimentos SET nome_completo = $1, telefone = $2, updated_at = NOW() WHERE id = $3',
      [nome, telefone, id],
    );
  }

  async concluir(id) {
    await query("UPDATE atendimentos SET status = 'concluido', updated_at = NOW() WHERE id = $1", [id]);
  }

  async salvarBeneficiosElegiveis(atendimentoId, beneficioIds) {
    await query('DELETE FROM atendimento_beneficios WHERE atendimento_id = $1', [atendimentoId]);

    for (const beneficioId of beneficioIds) {
      await query(
        `
          INSERT INTO atendimento_beneficios (atendimento_id, beneficio_id, selecionado)
          VALUES ($1, $2, FALSE)
          ON CONFLICT (atendimento_id, beneficio_id) DO NOTHING
        `,
        [atendimentoId, beneficioId],
      );
    }
  }

  async selecionarBeneficios(atendimentoId, beneficioIds) {
    await query('UPDATE atendimento_beneficios SET selecionado = FALSE WHERE atendimento_id = $1', [
      atendimentoId,
    ]);

    for (const beneficioId of beneficioIds) {
      await query(
        `
          UPDATE atendimento_beneficios
          SET selecionado = TRUE
          WHERE atendimento_id = $1 AND beneficio_id = $2
        `,
        [atendimentoId, beneficioId],
      );
    }
  }
}
