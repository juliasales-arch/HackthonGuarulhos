'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  DIMENSION_METADATA,
  LEVEL_CONFIG,
  ROLE_PROFILES,
  getSummaryStats,
  getVisibleTerritories,
  territories,
  type IvdsLevel,
  type TerritoryRecord,
  type UserRole,
  formatIvds
} from '@/lib/ivds-data';
import {
  DimensionProfileChart,
  DimensionStackChart,
  LevelDistributionChart,
  TerritoryScoreChart
} from '@/components/dashboard/analytics-charts';
import { LevelBadge, MetricCard } from '@/components/ui/metric-card';

const TerritorialMap = dynamic(() => import('@/components/dashboard/territorial-map'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[680px] items-center justify-center rounded-[30px] border border-[color:var(--border)] bg-[color:var(--bg-card)] text-sm text-[color:var(--text-secondary)]">
      Carregando mapa territorial...
    </div>
  )
});

type TabKey = 'territorial' | 'analytics' | 'recomendacoes';

const TAB_OPTIONS: Array<{ key: TabKey; label: string }> = [
  { key: 'territorial', label: 'Território' },
  { key: 'analytics', label: 'Análises' },
  { key: 'recomendacoes', label: 'Recomendações' }
];

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/6">
      <div className="h-full rounded-full" style={{ width: `${Math.max(6, value * 100)}%`, background: color }} />
    </div>
  );
}

function RankingPanel({
  items,
  selectedId,
  onSelect
}: {
  items: TerritoryRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const sorted = [...items].sort((left, right) => right.ivds - left.ivds);

  return (
    <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--bg-card)] p-5 shadow-soft">
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Ranking</p>
        <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">Bairros prioritários</h3>
      </div>
      <div className="space-y-3">
        {sorted.map((territory, index) => {
          const isActive = selectedId === territory.id;
          const level = LEVEL_CONFIG[territory.level];
          return (
            <button
              key={territory.id}
              onClick={() => onSelect(territory.id)}
              className="group w-full rounded-2xl border px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: isActive ? level.border : 'var(--border)',
                background: isActive ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)'
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[color:var(--text-muted)]">#{index + 1}</span>
                    <span className="text-sm font-semibold text-[color:var(--text-primary)]">{territory.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--text-secondary)]">{territory.region} · {territory.crasUnit}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold" style={{ color: level.color }}>{formatIvds(territory.ivds)}</div>
                  <LevelBadge level={territory.level} compact />
                </div>
              </div>
              <div className="mt-3">
                <MiniBar value={territory.ivds} color={level.color} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TerritoryDetail({ territory }: { territory?: TerritoryRecord }) {
  if (!territory) {
    return (
      <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--bg-card)] p-6 shadow-soft">
        <p className="text-sm text-[color:var(--text-secondary)]">Selecione um bairro para ver a leitura analítica.</p>
      </section>
    );
  }

  const level = LEVEL_CONFIG[territory.level];

  return (
    <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--bg-card)] p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Detalhe territorial</p>
          <h3 className="mt-1 text-2xl font-bold text-[color:var(--text-primary)]">{territory.name}</h3>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{territory.region} · {territory.crasUnit}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black tracking-tight text-[color:var(--text-primary)]">{formatIvds(territory.ivds)}</div>
          <div className="mt-2 flex justify-end"><LevelBadge level={territory.level} /></div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-[color:var(--text-secondary)]">
        <div className="rounded-2xl border border-[color:var(--border)] bg-white/3 px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">População</div>
          <div className="mt-1 font-semibold text-[color:var(--text-primary)]">{territory.population.toLocaleString('pt-BR')}</div>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-white/3 px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Famílias CadÚnico</div>
          <div className="mt-1 font-semibold text-[color:var(--text-primary)]">{territory.cadunicoFamilies.toLocaleString('pt-BR')}</div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {(Object.entries(territory.dimensionScores) as Array<[keyof TerritoryRecord['dimensionScores'], number]>).map(([dimension, value]) => (
          <div key={dimension}>
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-[color:var(--text-primary)]">{DIMENSION_METADATA[dimension].label}</span>
              <span className="font-mono text-[color:var(--text-muted)]">{formatIvds(value)}</span>
            </div>
            <MiniBar value={value} color={DIMENSION_METADATA[dimension].weight >= 0.2 ? level.color : '#7cb7ff'} />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Recomendação automática</p>
        <p className="mt-2 text-sm font-semibold text-[color:var(--text-primary)]">{territory.recommendation.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">{territory.recommendation.summary}</p>
        <ul className="mt-4 space-y-2 text-sm text-[color:var(--text-secondary)]">
          {territory.recommendation.actions.slice(0, 3).map((action) => (
            <li key={action} className="flex gap-2">
              <span className="mt-1 h-2 w-2 rounded-full" style={{ background: level.color }} />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-3xl border border-[color:var(--border)] px-4 py-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Dimensão mais crítica</p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <div>
            <div className="text-base font-semibold text-[color:var(--text-primary)]">{DIMENSION_METADATA[territory.dominantDimension].label}</div>
            <p className="text-sm text-[color:var(--text-secondary)]">{DIMENSION_METADATA[territory.dominantDimension].description}</p>
          </div>
          <span className="rounded-full border border-[color:var(--border)] px-3 py-1 font-mono text-xs text-[color:var(--text-primary)]">peso {Math.round(DIMENSION_METADATA[territory.dominantDimension].weight * 100)}%</span>
        </div>
      </div>
    </section>
  );
}

function RecommendationGrid({ items }: { items: TerritoryRecord[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {(['critical', 'high', 'medium', 'low'] as IvdsLevel[]).map((level) => {
        const group = [...items].filter((territory) => territory.level === level).sort((left, right) => right.ivds - left.ivds);
        if (!group.length) return null;
        const config = LEVEL_CONFIG[level];
        return (
          <section key={level} className="overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[color:var(--bg-card)] shadow-soft">
            <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4" style={{ background: config.background }}>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Nível {config.label}</p>
                <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">{group.length} territórios</h3>
              </div>
              <span className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: config.border, color: config.color }}>
                {config.range}
              </span>
            </div>
            <div className="divide-y divide-white/6">
              {group.map((territory) => (
                <div key={territory.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-[color:var(--text-primary)]">{territory.name}</div>
                      <p className="mt-1 text-xs text-[color:var(--text-secondary)]">{territory.recommendation.title}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold" style={{ color: config.color }}>{formatIvds(territory.ivds)}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">{territory.dominantDimension.toUpperCase()}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">{territory.recommendation.summary}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function IVDashboard() {
  const [role, setRole] = useState<UserRole>('admin');
  const [tab, setTab] = useState<TabKey>('territorial');
  const [selectedId, setSelectedId] = useState<string | null>(territories[0]?.id ?? null);

  const visibleTerritories = useMemo(() => getVisibleTerritories(role, territories), [role]);
  const summary = useMemo(() => getSummaryStats(visibleTerritories), [visibleTerritories]);
  const selectedTerritory = useMemo(
    () => visibleTerritories.find((territory) => territory.id === selectedId) ?? visibleTerritories[0],
    [selectedId, visibleTerritories]
  );

  useEffect(() => {
    if (!visibleTerritories.length) return;
    if (!visibleTerritories.some((territory) => territory.id === selectedId)) {
      setSelectedId(visibleTerritories[0].id);
    }
  }, [selectedId, visibleTerritories]);

  const criticalTerritories = visibleTerritories.filter((territory) => territory.level === 'critical');
  const regionalSummary = ROLE_PROFILES[role];

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-5">
        <header className="overflow-hidden rounded-[32px] border border-[color:var(--border)] bg-[color:var(--bg-surface)] shadow-soft backdrop-blur-xl">
          <div className="flex flex-col gap-6 border-b border-[color:var(--border)] px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.34em] text-[color:var(--text-muted)]">IVDS · Índice de Vulnerabilidade Digital Social</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-[color:var(--text-primary)] sm:text-4xl">
                Dashboard territorial para priorização de políticas públicas em Guarulhos
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--text-secondary)] sm:text-base">
                {regionalSummary.summary} O foco não é apenas internet: é autonomia digital, dependência de terceiros e acesso efetivo a direitos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Perfil ativo</div>
                <div className="mt-1 text-sm font-semibold text-[color:var(--text-primary)]">{regionalSummary.label}</div>
                <div className="text-xs text-[color:var(--text-secondary)]">{regionalSummary.subtitle}</div>
              </div>
              <label className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Controle de acesso</div>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className="mt-2 w-full bg-transparent text-sm font-semibold text-[color:var(--text-primary)] outline-none"
                >
                  {Object.entries(ROLE_PROFILES).map(([value, profile]) => (
                    <option key={value} value={value} className="text-slate-900">
                      {profile.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-5 xl:grid-cols-4">
            <MetricCard
              label="Territórios visíveis"
              value={visibleTerritories.length}
              hint={`de ${territories.length} bairros simulados para Guarulhos`}
              accent="#7cb7ff"
              icon={<span className="text-sm font-bold">GA</span>}
            />
            <MetricCard
              label="IVDS médio"
              value={summary.averageIvds.toFixed(2)}
              hint="score territorial médio no recorte atual"
              accent="#15b79e"
              icon={<span className="text-sm font-bold">IV</span>}
            />
            <MetricCard
              label="Bairros críticos"
              value={summary.criticalCount}
              hint="intervenção imediata recomendada"
              accent="#ef4444"
              icon={<span className="text-sm font-bold">!!</span>}
            />
            <MetricCard
              label="População prioritária"
              value={summary.priorityPopulation.toLocaleString('pt-BR')}
              hint="pessoas em territórios críticos ou altos"
              accent="#f97316"
              icon={<span className="text-sm font-bold">PG</span>}
            />
          </div>
        </header>

        <section className="flex flex-wrap items-center gap-3 rounded-[28px] border border-[color:var(--border)] bg-[color:var(--bg-card)] px-4 py-3 shadow-soft">
          {TAB_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setTab(option.key)}
              className="rounded-2xl border px-4 py-2 text-sm font-semibold transition"
              style={{
                borderColor: tab === option.key ? 'rgba(124, 183, 255, 0.34)' : 'transparent',
                background: tab === option.key ? 'rgba(124, 183, 255, 0.14)' : 'transparent',
                color: tab === option.key ? '#dce7ff' : 'var(--text-secondary)'
              }}
            >
              {option.label}
            </button>
          ))}
          <div className="ml-auto rounded-2xl border border-[color:var(--border)] px-4 py-2 text-xs text-[color:var(--text-secondary)]">
            {criticalTerritories.length ? `${criticalTerritories.length} bairros em estado crítico` : 'Sem bairros críticos no recorte atual'}
          </div>
        </section>

        {tab === 'territorial' ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.75fr)_360px]">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_320px]">
              <TerritorialMap territories={visibleTerritories} selectedId={selectedTerritory?.id ?? null} onSelect={setSelectedId} />
              <div className="grid gap-4">
                <RankingPanel items={visibleTerritories} selectedId={selectedTerritory?.id ?? null} onSelect={setSelectedId} />
                <TerritoryDetail territory={selectedTerritory} />
              </div>
            </div>
            <div className="grid gap-4">
              <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--bg-card)] p-5 shadow-soft">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Resumo executivo</p>
                <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">Leitura territorial para decisão pública</h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                  O IVDS identifica onde a pessoa até tem celular, mas não consegue acessar direitos digitais com autonomia. O foco operacional é priorizar CRAS, campanhas presenciais, atendimento assistido e comunicação em áudio.
                </p>
                <div className="mt-5 grid gap-3 text-sm text-[color:var(--text-secondary)]">
                  {criticalTerritories.slice(0, 4).map((territory) => (
                    <div key={territory.id} className="rounded-2xl border border-[color:var(--border)] px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-[color:var(--text-primary)]">{territory.name}</span>
                        <span className="font-mono text-sm" style={{ color: LEVEL_CONFIG[territory.level].color }}>
                          {territory.ivds.toFixed(2)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed">{territory.recommendation.title}</p>
                    </div>
                  ))}
                </div>
              </section>
              <DimensionProfileChart territories={visibleTerritories} selectedTerritory={selectedTerritory ?? null} />
            </div>
          </div>
        ) : null}

        {tab === 'analytics' ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <TerritoryScoreChart territories={visibleTerritories} />
            <LevelDistributionChart territories={visibleTerritories} />
            <DimensionStackChart territories={visibleTerritories} />
            <section className="overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[color:var(--bg-card)] shadow-soft">
              <div className="border-b border-[color:var(--border)] px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Tabela analítica</p>
                <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">IVDS por bairro no recorte atual</h3>
              </div>
              <div className="overflow-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                  <thead className="sticky top-0 bg-[color:var(--bg-elevated)]">
                    <tr>
                      {['Bairro', 'Região', 'IVDS', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'Dimensão crítica'].map((label) => (
                        <th key={label} className="border-b border-[color:var(--border)] px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...visibleTerritories].sort((left, right) => right.ivds - left.ivds).map((territory) => (
                      <tr
                        key={territory.id}
                        className="cursor-pointer transition hover:bg-white/4"
                        onClick={() => {
                          setSelectedId(territory.id);
                          setTab('territorial');
                        }}
                      >
                        <td className="border-b border-[color:var(--border)] px-4 py-3 font-semibold text-[color:var(--text-primary)]">{territory.name}</td>
                        <td className="border-b border-[color:var(--border)] px-4 py-3 text-[color:var(--text-secondary)]">{territory.region}</td>
                        <td className="border-b border-[color:var(--border)] px-4 py-3 font-mono text-[color:var(--text-primary)]">{territory.ivds.toFixed(2)}</td>
                        {(Object.entries(territory.dimensionScores) as Array<[keyof TerritoryRecord['dimensionScores'], number]>).map(([dimension, value]) => (
                          <td key={dimension} className="border-b border-[color:var(--border)] px-4 py-3 font-mono text-[color:var(--text-secondary)]">
                            {value.toFixed(2)}
                          </td>
                        ))}
                        <td className="border-b border-[color:var(--border)] px-4 py-3 text-[color:var(--text-secondary)]">{DIMENSION_METADATA[territory.dominantDimension].shortLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}

        {tab === 'recomendacoes' ? <RecommendationGrid items={visibleTerritories} /> : null}
      </div>
    </main>
  );
}
