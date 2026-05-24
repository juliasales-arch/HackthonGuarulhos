import { query } from '../config/database.js';

export async function runMigrations() {
  await query(`
    CREATE TABLE IF NOT EXISTS faixas_renda (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      renda_minima NUMERIC(12, 2),
      renda_maxima NUMERIC(12, 2),
      ativo BOOLEAN NOT NULL DEFAULT TRUE
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS beneficios (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL UNIQUE,
      descricao TEXT,
      ativo BOOLEAN NOT NULL DEFAULT TRUE
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS atendimentos (
      id UUID PRIMARY KEY,
      nome_completo TEXT,
      telefone TEXT,
      qtd_pessoas INTEGER NOT NULL DEFAULT 1,
      faixa_etaria_0_5 INTEGER NOT NULL DEFAULT 0,
      faixa_etaria_6_17 INTEGER NOT NULL DEFAULT 0,
      faixa_etaria_18_59 INTEGER NOT NULL DEFAULT 1,
      faixa_etaria_60_mais INTEGER NOT NULL DEFAULT 0,
      faixa_renda_id INTEGER REFERENCES faixas_renda(id),
      condicoes_familia JSONB NOT NULL DEFAULT '[]'::jsonb,
      beneficios_atuais JSONB NOT NULL DEFAULT '[]'::jsonb,
      status TEXT NOT NULL DEFAULT 'em_andamento',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS slots_agendamento (
      id SERIAL PRIMARY KEY,
      data DATE NOT NULL,
      horario TIME NOT NULL,
      local TEXT NOT NULL,
      endereco TEXT NOT NULL,
      vagas_total INTEGER NOT NULL DEFAULT 1,
      vagas_ocupadas INTEGER NOT NULL DEFAULT 0,
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      UNIQUE (data, horario)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS agendamentos (
      id SERIAL PRIMARY KEY,
      atendimento_id UUID NOT NULL REFERENCES atendimentos(id) ON DELETE CASCADE,
      data_agendamento DATE NOT NULL,
      horario TIME NOT NULL,
      local TEXT NOT NULL,
      endereco TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'agendado',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS atendimento_beneficios (
      atendimento_id UUID NOT NULL REFERENCES atendimentos(id) ON DELETE CASCADE,
      beneficio_id INTEGER NOT NULL REFERENCES beneficios(id),
      selecionado BOOLEAN NOT NULL DEFAULT FALSE,
      PRIMARY KEY (atendimento_id, beneficio_id)
    );
  `);

  await seedBaseData();
}

async function seedBaseData() {
  await query(`
    INSERT INTO faixas_renda (id, nome, renda_minima, renda_maxima, ativo)
    VALUES
      (1, 'Ate R$ 218 por pessoa', 0, 218, TRUE),
      (2, 'Ate R$ 706 por pessoa', 218.01, 706, TRUE),
      (3, 'Acima de R$ 706 por pessoa', 706.01, NULL, TRUE),
      (4, 'Sem renda', 0, 0, TRUE)
    ON CONFLICT (id) DO NOTHING;
  `);

  await query(`
    INSERT INTO beneficios (nome, descricao, ativo)
    VALUES
      ('Bolsa Familia', 'Transferencia de renda para familias em vulnerabilidade.', TRUE),
      ('Tarifa Social de Energia Eletrica', 'Desconto na conta de energia eletrica.', TRUE),
      ('Tarifa Social de Agua e Esgoto', 'Desconto na conta de agua e esgoto.', TRUE),
      ('ID Jovem', 'Beneficios para jovens de baixa renda.', TRUE),
      ('Carteira da Pessoa Idosa', 'Beneficios para pessoas idosas.', TRUE),
      ('Viva Leite', 'Apoio alimentar para criancas e gestantes.', TRUE),
      ('BPC / LOAS', 'Beneficio assistencial para idosos ou pessoas com deficiencia.', TRUE),
      ('Seguro Desemprego', 'Apoio temporario ao trabalhador desempregado.', TRUE),
      ('Auxilio Doenca', 'Apoio para incapacidade temporaria.', TRUE)
    ON CONFLICT (nome) DO NOTHING;
  `);

  await query(`
    INSERT INTO slots_agendamento (data, horario, local, endereco, vagas_total, vagas_ocupadas, ativo)
    VALUES
      (CURRENT_DATE + INTERVAL '1 day', '09:00', 'CRAS Centro', 'Rua Principal, 100', 5, 0, TRUE),
      (CURRENT_DATE + INTERVAL '1 day', '10:00', 'CRAS Centro', 'Rua Principal, 100', 5, 0, TRUE),
      (CURRENT_DATE + INTERVAL '2 days', '14:00', 'CRAS Pimentas', 'Avenida Pimentas, 200', 5, 0, TRUE)
    ON CONFLICT (data, horario) DO NOTHING;
  `);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log('[migrations] concluidas');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[migrations] falha:', error);
      process.exit(1);
    });
}
