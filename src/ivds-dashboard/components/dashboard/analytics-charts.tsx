'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { DIMENSION_METADATA, LEVEL_CONFIG, type TerritoryRecord, getDimensionProfile, getLevelSummary, formatIvds } from '@/lib/ivds-data';

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--bg-card)] p-5 shadow-soft">
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">{title}</p>
        <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">{subtitle}</h3>
      </div>
      <div className="h-[320px]">{children}</div>
    </section>
  );
}

const tooltipStyle = {
  backgroundColor: 'rgba(8,16,33,0.96)',
  border: '1px solid rgba(151, 177, 232, 0.18)',
  borderRadius: 16,
  color: '#f4f7fb',
  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.24)'
};

export function TerritoryScoreChart({ territories }: { territories: TerritoryRecord[] }) {
  const data = [...territories].sort((left, right) => right.ivds - left.ivds).slice(0, 8).map((territory) => ({
    name: territory.name,
    ivds: territory.ivds,
    level: territory.level
  }));

  return (
    <ChartCard title="Ranking" subtitle="Top bairros por IVDS">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 20, left: 16, bottom: 4 }}>
          <CartesianGrid stroke="rgba(151, 177, 232, 0.12)" strokeDasharray="4 4" horizontal={false} />
          <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => value.toFixed(1)} stroke="#7e92b6" />
          <YAxis type="category" dataKey="name" width={108} stroke="#7e92b6" tick={{ fill: '#b8c7de', fontSize: 11 }} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [formatIvds(value), 'IVDS']}
            labelStyle={{ color: '#f4f7fb', fontWeight: 700 }}
          />
          <Bar dataKey="ivds" radius={[0, 12, 12, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={LEVEL_CONFIG[entry.level].color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function LevelDistributionChart({ territories }: { territories: TerritoryRecord[] }) {
  const data = getLevelSummary(territories).map((item) => ({
    ...item,
    value: item.count
  }));

  return (
    <ChartCard title="Distribuição" subtitle="Bairros por nível de risco">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={72}
            outerRadius={112}
            paddingAngle={4}
          >
            {data.map((entry) => (
              <Cell key={entry.level} fill={LEVEL_CONFIG[entry.level].color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend verticalAlign="bottom" iconType="circle" formatter={(value) => <span style={{ color: '#b8c7de' }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DimensionProfileChart({
  territories,
  selectedTerritory
}: {
  territories: TerritoryRecord[];
  selectedTerritory?: TerritoryRecord | null;
}) {
  const averageProfile = getDimensionProfile(territories);
  const focusTerritory = selectedTerritory ?? territories[0];

  const data = averageProfile.map((dimension) => ({
    dimension: dimension.fullLabel,
    municipio: dimension.value,
    selecionado: focusTerritory?.dimensionScores[dimension.key as keyof TerritoryRecord['dimensionScores']] ?? 0,
    weight: dimension.weight
  }));

  return (
    <ChartCard title="Dimensões" subtitle={`Perfil comparado do território e média municipal · foco em ${focusTerritory?.name ?? 'Guarulhos'}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius={108}>
          <PolarGrid stroke="rgba(151, 177, 232, 0.16)" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: '#b8c7de', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} tick={{ fill: '#7e92b6', fontSize: 10 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Radar name="Média municipal" dataKey="municipio" stroke="#7cb7ff" fill="#7cb7ff" fillOpacity={0.16} />
          <Radar name={focusTerritory?.name ?? 'Selecionado'} dataKey="selecionado" stroke="#f97316" fill="#f97316" fillOpacity={0.22} />
          <Legend verticalAlign="bottom" />
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DimensionStackChart({ territories }: { territories: TerritoryRecord[] }) {
  const data = getDimensionProfile(territories).map((dimension) => ({
    label: DIMENSION_METADATA[dimension.key].shortLabel,
    value: dimension.value,
    full: dimension.fullLabel
  }));

  return (
    <ChartCard title="Média" subtitle="Média das dimensões no recorte atual">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: 4, bottom: 8 }}>
          <CartesianGrid stroke="rgba(151, 177, 232, 0.12)" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#b8c7de', fontSize: 11 }} />
          <YAxis domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} tick={{ fill: '#7e92b6', fontSize: 10 }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatIvds(value), 'Score médio']} labelStyle={{ color: '#f4f7fb', fontWeight: 700 }} />
          <Bar dataKey="value" radius={[12, 12, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={entry.label}
                fill={['#7cb7ff', '#5ed4ff', '#15b79e', '#f97316', '#eab308', '#22c55e'][index]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
