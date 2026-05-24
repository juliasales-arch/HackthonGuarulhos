export type UserRole = 'admin' | 'cras' | 'operator';
export type IvdsLevel = 'critical' | 'high' | 'medium' | 'low';
export type DimensionKey = 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6';
export type LatLngTuple = [number, number];

export interface Recommendation {
  title: string;
  summary: string;
  actions: string[];
  signals: string[];
}

export interface TerritorySeed {
  id: string;
  name: string;
  region: string;
  macroRegion: string;
  crasUnit: string;
  center: LatLngTuple;
  population: number;
  households: number;
  cadunicoFamilies: number;
  elderlyPopulation: number;
  indicators: {
    d1: number[];
    d2: number[];
    d3: number[];
    d4: number[];
    d5: number[];
    d6: number[];
  };
}

export interface TerritoryRecord extends TerritorySeed {
  polygon: LatLngTuple[];
  dimensionScores: Record<DimensionKey, number>;
  contributions: Record<DimensionKey, number>;
  ivds: number;
  level: IvdsLevel;
  dominantDimension: DimensionKey;
  recommendation: Recommendation;
}

export interface SummaryStats {
  total: number;
  averageIvds: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  priorityPopulation: number;
  priorityFamilies: number;
  averageScores: Record<DimensionKey, number>;
}

export const DIMENSION_METADATA: Record<
  DimensionKey,
  { label: string; weight: number; shortLabel: string; description: string }
> = {
  d1: {
    label: 'Exclusão Etária',
    shortLabel: 'D1',
    weight: 0.2,
    description: 'População idosa e razão de dependência etária'
  },
  d2: {
    label: 'Letramento Digital',
    shortLabel: 'D2',
    weight: 0.2,
    description: 'Escolaridade, letramento funcional e autonomia digital'
  },
  d3: {
    label: 'Acesso e Conectividade',
    shortLabel: 'D3',
    weight: 0.15,
    description: 'Qualidade da conexão e dependência de dados móveis'
  },
  d4: {
    label: 'Dependência Digital',
    shortLabel: 'D4',
    weight: 0.15,
    description: 'Ajuda de terceiros, apps públicos e procura presencial'
  },
  d5: {
    label: 'Direitos Digitais Negados',
    shortLabel: 'D5',
    weight: 0.15,
    description: 'Baixo uso de serviços digitais e dificuldade no acesso a direitos'
  },
  d6: {
    label: 'Vulnerabilidade Econômica',
    shortLabel: 'D6',
    weight: 0.15,
    description: 'Renda baixa, programas sociais e vulnerabilidade econômica'
  }
};

export const LEVEL_CONFIG: Record<
  IvdsLevel,
  { label: string; color: string; border: string; background: string; range: string }
> = {
  critical: {
    label: 'Crítico',
    color: '#ef4444',
    border: 'rgba(239, 68, 68, 0.28)',
    background: 'rgba(239, 68, 68, 0.12)',
    range: '0.75 a 1.00'
  },
  high: {
    label: 'Alto',
    color: '#f97316',
    border: 'rgba(249, 115, 22, 0.28)',
    background: 'rgba(249, 115, 22, 0.12)',
    range: '0.55 a 0.74'
  },
  medium: {
    label: 'Médio',
    color: '#eab308',
    border: 'rgba(234, 179, 8, 0.28)',
    background: 'rgba(234, 179, 8, 0.12)',
    range: '0.35 a 0.54'
  },
  low: {
    label: 'Baixo',
    color: '#22c55e',
    border: 'rgba(34, 197, 94, 0.28)',
    background: 'rgba(34, 197, 94, 0.12)',
    range: '0.00 a 0.34'
  }
};

export const ROLE_PROFILES: Record<
  UserRole,
  { label: string; subtitle: string; summary: string }
> = {
  admin: {
    label: 'Governo / Admin',
    subtitle: 'Visão completa do município',
    summary: 'Analytics globais, comparação entre bairros e priorização intersetorial.'
  },
  cras: {
    label: 'Gestor CRAS',
    subtitle: 'Leitura regional e operacional',
    summary: 'Recorte territorial para planejamento de campo, mutirões e busca ativa.'
  },
  operator: {
    label: 'Operador',
    subtitle: 'Visão simples e acionável',
    summary: 'Lista priorizada com foco em atendimento assistido e comunicação clara.'
  }
};

const dimensionWeights: Record<DimensionKey, number> = {
  d1: DIMENSION_METADATA.d1.weight,
  d2: DIMENSION_METADATA.d2.weight,
  d3: DIMENSION_METADATA.d3.weight,
  d4: DIMENSION_METADATA.d4.weight,
  d5: DIMENSION_METADATA.d5.weight,
  d6: DIMENSION_METADATA.d6.weight
};

const territorySeeds: TerritorySeed[] = [
  {
    id: 'centro',
    name: 'Centro',
    region: 'Central',
    macroRegion: 'Centro Expandido',
    crasUnit: 'CRAS Centro',
    center: [-23.4548, -46.5263],
    population: 49210,
    households: 17620,
    cadunicoFamilies: 2840,
    elderlyPopulation: 8420,
    indicators: {
      d1: [22, 18],
      d2: [24, 20, 27],
      d3: [19, 17, 23],
      d4: [18, 19, 16],
      d5: [20, 18],
      d6: [17, 21, 19]
    }
  },
  {
    id: 'vila-galvao',
    name: 'Vila Galvão',
    region: 'Oeste',
    macroRegion: 'Oeste Consolidado',
    crasUnit: 'CRAS Vila Galvão',
    center: [-23.4442, -46.5562],
    population: 38650,
    households: 13140,
    cadunicoFamilies: 2620,
    elderlyPopulation: 6110,
    indicators: {
      d1: [33, 36],
      d2: [35, 38, 34],
      d3: [31, 29, 33],
      d4: [32, 34, 30],
      d5: [27, 31],
      d6: [29, 34, 30]
    }
  },
  {
    id: 'gopouva',
    name: 'Gopoúva',
    region: 'Oeste',
    macroRegion: 'Oeste Consolidado',
    crasUnit: 'CRAS Gopoúva',
    center: [-23.4474, -46.5328],
    population: 42580,
    households: 14860,
    cadunicoFamilies: 3180,
    elderlyPopulation: 6880,
    indicators: {
      d1: [40, 38],
      d2: [42, 44, 40],
      d3: [36, 35, 38],
      d4: [39, 41, 37],
      d5: [32, 34],
      d6: [35, 38, 36]
    }
  },
  {
    id: 'jardim-maia',
    name: 'Jardim Maia',
    region: 'Centro-Oeste',
    macroRegion: 'Centro Consolidado',
    crasUnit: 'CRAS Centro-Oeste',
    center: [-23.4656, -46.5402],
    population: 27520,
    households: 9310,
    cadunicoFamilies: 1480,
    elderlyPopulation: 3720,
    indicators: {
      d1: [28, 25],
      d2: [31, 30, 27],
      d3: [26, 28, 24],
      d4: [27, 29, 25],
      d5: [22, 24],
      d6: [25, 29, 26]
    }
  },
  {
    id: 'cumbica',
    name: 'Cumbica',
    region: 'Leste',
    macroRegion: 'Periferia Industrial',
    crasUnit: 'CRAS Cumbica',
    center: [-23.4592, -46.4728],
    population: 61140,
    households: 20300,
    cadunicoFamilies: 6480,
    elderlyPopulation: 8440,
    indicators: {
      d1: [71, 69],
      d2: [73, 75, 71],
      d3: [74, 77, 72],
      d4: [69, 72, 68],
      d5: [67, 70],
      d6: [75, 78, 74]
    }
  },
  {
    id: 'pimentas',
    name: 'Pimentas',
    region: 'Leste',
    macroRegion: 'Periferia Extensa',
    crasUnit: 'CRAS Pimentas',
    center: [-23.4728, -46.4474],
    population: 98420,
    households: 31480,
    cadunicoFamilies: 12480,
    elderlyPopulation: 12160,
    indicators: {
      d1: [79, 76],
      d2: [81, 79, 78],
      d3: [83, 84, 80],
      d4: [82, 83, 81],
      d5: [77, 79],
      d6: [84, 86, 83]
    }
  },
  {
    id: 'bonsucesso',
    name: 'Bonsucesso',
    region: 'Leste',
    macroRegion: 'Periferia Extensa',
    crasUnit: 'CRAS Bonsucesso',
    center: [-23.3892, -46.4127],
    population: 70310,
    households: 22640,
    cadunicoFamilies: 8620,
    elderlyPopulation: 10240,
    indicators: {
      d1: [86, 84],
      d2: [88, 86, 84],
      d3: [85, 87, 86],
      d4: [88, 87, 86],
      d5: [89, 87],
      d6: [91, 92, 90]
    }
  },
  {
    id: 'jardim-presidente-dutra',
    name: 'Jardim Presidente Dutra',
    region: 'Norte',
    macroRegion: 'Periferia de Alta Pressão Social',
    crasUnit: 'CRAS Presidente Dutra',
    center: [-23.4296, -46.4254],
    population: 81280,
    households: 25130,
    cadunicoFamilies: 9760,
    elderlyPopulation: 13120,
    indicators: {
      d1: [89, 87],
      d2: [91, 89, 88],
      d3: [88, 86, 87],
      d4: [92, 91, 90],
      d5: [90, 91],
      d6: [94, 95, 93]
    }
  },
  {
    id: 'taboao',
    name: 'Taboão',
    region: 'Norte',
    macroRegion: 'Periferia Consolidada',
    crasUnit: 'CRAS Taboão',
    center: [-23.4075, -46.4983],
    population: 51820,
    households: 16720,
    cadunicoFamilies: 5320,
    elderlyPopulation: 7560,
    indicators: {
      d1: [61, 58],
      d2: [60, 59, 61],
      d3: [58, 56, 59],
      d4: [62, 61, 60],
      d5: [53, 54],
      d6: [59, 60, 58]
    }
  },
  {
    id: 'jardim-sao-joao',
    name: 'Jardim São João',
    region: 'Norte',
    macroRegion: 'Periferia de Alta Pressão Social',
    crasUnit: 'CRAS São João',
    center: [-23.4794, -46.4364],
    population: 66440,
    households: 21310,
    cadunicoFamilies: 7820,
    elderlyPopulation: 10320,
    indicators: {
      d1: [72, 68],
      d2: [71, 69, 70],
      d3: [69, 67, 68],
      d4: [73, 71, 72],
      d5: [68, 69],
      d6: [74, 72, 73]
    }
  },
  {
    id: 'cidade-serodio',
    name: 'Cidade Seródio',
    region: 'Sul',
    macroRegion: 'Sul Intermediário',
    crasUnit: 'CRAS Cidade Seródio',
    center: [-23.5012, -46.5098],
    population: 33890,
    households: 11160,
    cadunicoFamilies: 2710,
    elderlyPopulation: 4520,
    indicators: {
      d1: [45, 42],
      d2: [50, 48, 47],
      d3: [46, 44, 45],
      d4: [48, 49, 47],
      d5: [39, 41],
      d6: [44, 46, 45]
    }
  },
  {
    id: 'cabucu',
    name: 'Cabuçu',
    region: 'Norte',
    macroRegion: 'Periferia em Expansão',
    crasUnit: 'CRAS Cabuçu',
    center: [-23.3328, -46.4012],
    population: 28940,
    households: 9560,
    cadunicoFamilies: 2210,
    elderlyPopulation: 3680,
    indicators: {
      d1: [53, 51],
      d2: [57, 55, 54],
      d3: [58, 60, 56],
      d4: [55, 54, 53],
      d5: [49, 50],
      d6: [56, 57, 55]
    }
  },
  {
    id: 'cocaia',
    name: 'Cocaia',
    region: 'Sul',
    macroRegion: 'Sul Intermediário',
    crasUnit: 'CRAS Cocaia',
    center: [-23.4971, -46.5448],
    population: 44780,
    households: 14820,
    cadunicoFamilies: 4180,
    elderlyPopulation: 6180,
    indicators: {
      d1: [37, 39],
      d2: [41, 42, 40],
      d3: [39, 40, 38],
      d4: [43, 41, 42],
      d5: [35, 36],
      d6: [40, 42, 41]
    }
  }
];

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function polygonFromCenter([lat, lng]: LatLngTuple, latRadius = 0.018, lngRadius = 0.024): LatLngTuple[] {
  return [
    [lat + latRadius, lng - lngRadius],
    [lat + latRadius * 0.92, lng + lngRadius * 0.98],
    [lat - latRadius * 1.03, lng + lngRadius * 0.86],
    [lat - latRadius * 0.98, lng - lngRadius * 1.04]
  ];
}

function dimensionAverage(indicators: number[]) {
  return average(indicators) / 100;
}

function levelFromScore(score: number): IvdsLevel {
  if (score >= 0.75) return 'critical';
  if (score >= 0.55) return 'high';
  if (score >= 0.35) return 'medium';
  return 'low';
}

function dominantDimension(contributions: Record<DimensionKey, number>) {
  return (Object.entries(contributions).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'd1') as DimensionKey;
}

function createRecommendation(dimensionScores: Record<DimensionKey, number>, level: IvdsLevel): Recommendation {
  const actions: string[] = [];
  const signals: string[] = [];

  if (dimensionScores.d1 >= 0.7 && dimensionScores.d2 >= 0.65) {
    actions.push('Priorizar comunicação em áudio e linguagem simplificada.');
    signals.push('Idosos e baixa autonomia digital em conjunto elevam a chance de abandono digital.');
  }

  if (dimensionScores.d3 >= 0.7 && dimensionScores.d6 >= 0.65) {
    actions.push('Instalar ponto acessível de atendimento com internet assistida.');
    signals.push('Conectividade frágil combinada com vulnerabilidade econômica limita o uso autônomo de serviços.');
  }

  if (dimensionScores.d4 >= 0.68) {
    actions.push('Planejar campanha presencial com agentes comunitários.');
    signals.push('Dependência de terceiros sugere que o serviço digital não está resolvendo sozinho.');
  }

  if (dimensionScores.d5 >= 0.64) {
    actions.push('Realizar mutirão CRAS para acesso a direitos digitais.');
    signals.push('Há demanda represada em benefícios e serviços públicos digitalizados.');
  }

  if (dimensionScores.d6 >= 0.7 && level !== 'low') {
    actions.push('Priorizar atendimento assistido e triagem socioeconômica.');
    signals.push('Renda baixa tende a amplificar todas as demais barreiras digitais.');
  }

  if (!actions.length) {
    actions.push('Manter comunicação digital com monitoramento territorial trimestral.');
    signals.push('O território pode ser atendido com suporte pontual e prevenção leve.');
  }

  const title = actions[0];
  const summary =
    level === 'critical'
      ? 'Intervenção imediata recomendada. O território acumula múltiplas barreiras digitais e sociais.'
      : level === 'high'
        ? 'Prioridade alta para campanha territorial e atendimento assistido.'
        : level === 'medium'
          ? 'Monitoramento ativo com ações preventivas e comunicação clara.'
          : 'Baixa vulnerabilidade relativa. Manter prevenção e apoio eventual.';

  return { title, summary, actions, signals };
}

export function calculateTerritory(seed: TerritorySeed): TerritoryRecord {
  const dimensionScores: Record<DimensionKey, number> = {
    d1: dimensionAverage(seed.indicators.d1),
    d2: dimensionAverage(seed.indicators.d2),
    d3: dimensionAverage(seed.indicators.d3),
    d4: dimensionAverage(seed.indicators.d4),
    d5: dimensionAverage(seed.indicators.d5),
    d6: dimensionAverage(seed.indicators.d6)
  };

  const contributions: Record<DimensionKey, number> = {
    d1: dimensionScores.d1 * dimensionWeights.d1,
    d2: dimensionScores.d2 * dimensionWeights.d2,
    d3: dimensionScores.d3 * dimensionWeights.d3,
    d4: dimensionScores.d4 * dimensionWeights.d4,
    d5: dimensionScores.d5 * dimensionWeights.d5,
    d6: dimensionScores.d6 * dimensionWeights.d6
  };

  const ivds = Object.values(contributions).reduce((sum, value) => sum + value, 0);
  const level = levelFromScore(ivds);

  return {
    ...seed,
    polygon: polygonFromCenter(seed.center),
    dimensionScores,
    contributions,
    ivds,
    level,
    dominantDimension: dominantDimension(contributions),
    recommendation: createRecommendation(dimensionScores, level)
  };
}

export const territories: TerritoryRecord[] = territorySeeds.map(calculateTerritory);

export function getVisibleTerritories(role: UserRole, source: TerritoryRecord[] = territories) {
  if (role === 'cras') {
    return source.filter((territory) => territory.macroRegion !== 'Centro Expandido');
  }

  if (role === 'operator') {
    return source.filter((territory) => territory.level === 'critical' || territory.level === 'high');
  }

  return source;
}

export function getSummaryStats(source: TerritoryRecord[] = territories): SummaryStats {
  const total = source.length;
  const averageIvds = total ? source.reduce((sum, territory) => sum + territory.ivds, 0) / total : 0;
  const counts = source.reduce(
    (accumulator, territory) => {
      accumulator[territory.level] += 1;
      return accumulator;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );

  const priorityPopulation = source
    .filter((territory) => territory.level === 'critical' || territory.level === 'high')
    .reduce((sum, territory) => sum + territory.population, 0);

  const priorityFamilies = source
    .filter((territory) => territory.level === 'critical' || territory.level === 'high')
    .reduce((sum, territory) => sum + territory.cadunicoFamilies, 0);

  const averageScores = (['d1', 'd2', 'd3', 'd4', 'd5', 'd6'] as DimensionKey[]).reduce(
    (accumulator, dimension) => {
      accumulator[dimension] = total
        ? source.reduce((sum, territory) => sum + territory.dimensionScores[dimension], 0) / total
        : 0;
      return accumulator;
    },
    {} as Record<DimensionKey, number>
  );

  return {
    total,
    averageIvds,
    criticalCount: counts.critical,
    highCount: counts.high,
    mediumCount: counts.medium,
    lowCount: counts.low,
    priorityPopulation,
    priorityFamilies,
    averageScores
  };
}

export function getLevelSummary(source: TerritoryRecord[] = territories) {
  return (['critical', 'high', 'medium', 'low'] as IvdsLevel[]).map((level) => ({
    level,
    ...LEVEL_CONFIG[level],
    count: source.filter((territory) => territory.level === level).length
  }));
}

export function getDimensionProfile(source: TerritoryRecord[] = territories) {
  const total = source.length || 1;
  return (['d1', 'd2', 'd3', 'd4', 'd5', 'd6'] as DimensionKey[]).map((dimension) => ({
    key: dimension,
    label: DIMENSION_METADATA[dimension].shortLabel,
    fullLabel: DIMENSION_METADATA[dimension].label,
    value: source.reduce((sum, territory) => sum + territory.dimensionScores[dimension], 0) / total,
    weight: DIMENSION_METADATA[dimension].weight
  }));
}

export function formatIvds(score: number) {
  return score.toFixed(2);
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function colorForScore(score: number) {
  if (score >= 0.75) return LEVEL_CONFIG.critical.color;
  if (score >= 0.55) return LEVEL_CONFIG.high.color;
  if (score >= 0.35) return LEVEL_CONFIG.medium.color;
  return LEVEL_CONFIG.low.color;
}

export function contributionShare(source: TerritoryRecord[]) {
  const totalContribution = source.reduce((sum, territory) => sum + territory.ivds, 0) || 1;
  return (['d1', 'd2', 'd3', 'd4', 'd5', 'd6'] as DimensionKey[]).map((dimension) => ({
    key: dimension,
    label: DIMENSION_METADATA[dimension].shortLabel,
    contribution: source.reduce((sum, territory) => sum + territory.contributions[dimension], 0),
    share: source.reduce((sum, territory) => sum + territory.contributions[dimension], 0) / totalContribution
  }));
}
