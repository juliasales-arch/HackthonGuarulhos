'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { LEVEL_CONFIG, type LatLngTuple, type TerritoryRecord } from '@/lib/ivds-data';

type TerritorialMapProps = {
  territories: TerritoryRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const DISPLAY_IDS = ['centro', 'pimentas', 'bonsucesso', 'cumbica', 'vila-galvao', 'taboao'] as const;

const ZONE_CONFIG: Record<(typeof DISPLAY_IDS)[number], { center: LatLngTuple; coreRadius: number }> = {
  centro: { center: [-23.4538, -46.5323], coreRadius: 1300 },
  'vila-galvao': { center: [-23.4368, -46.5594], coreRadius: 1550 },
  taboao: { center: [-23.4282, -46.5051], coreRadius: 1650 },
  cumbica: { center: [-23.4788, -46.4791], coreRadius: 2100 },
  pimentas: { center: [-23.5136, -46.4496], coreRadius: 2500 },
  bonsucesso: { center: [-23.4418, -46.4306], coreRadius: 2350 }
};

function colorForLevel(level: TerritoryRecord['level']) {
  if (level === 'critical') return '#d73f45';
  if (level === 'high') return '#e17b2f';
  if (level === 'medium') return '#d4a63a';
  return '#3f9969';
}

export default function TerritorialMap({ territories, selectedId, onSelect }: TerritorialMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const layerRef = useRef<Record<string, { glow: L.Circle; core: L.Circle }>>({});

  const visibleTerritories = useMemo(
    () => territories.filter((territory) => DISPLAY_IDS.includes(territory.id as (typeof DISPLAY_IDS)[number])),
    [territories]
  );

  const selectedTerritory = visibleTerritories.find((territory) => territory.id === selectedId) ?? visibleTerritories[0] ?? null;
  const focusTerritory = visibleTerritories.find((territory) => territory.id === hoveredId) ?? selectedTerritory;

  const territoryById = useMemo(() => new Map(visibleTerritories.map((territory) => [territory.id, territory])), [visibleTerritories]);

  function styleForCore(territory: TerritoryRecord, isSelected: boolean, isHovered: boolean): L.PathOptions {
    const levelColor = colorForLevel(territory.level);
    return {
      color: isSelected || isHovered ? '#f8fafc' : levelColor,
      weight: isSelected ? 2.1 : isHovered ? 1.8 : 1.2,
      opacity: 0.86,
      fillColor: levelColor,
      fillOpacity: isSelected ? 0.5 : isHovered ? 0.44 : 0.36,
      className: `map-heat-core map-heat-core--${territory.level}${isSelected ? ' map-heat-core--selected' : ''}`
    };
  }

  function styleForGlow(territory: TerritoryRecord, isSelected: boolean, isHovered: boolean): L.PathOptions {
    const levelColor = colorForLevel(territory.level);
    return {
      stroke: false,
      fillColor: levelColor,
      fillOpacity: isSelected ? 0.22 : isHovered ? 0.18 : 0.13,
      className: `map-heat-glow map-heat-glow--${territory.level}`
    };
  }

  function zoneCenter(territory: TerritoryRecord): LatLngTuple {
    const configured = ZONE_CONFIG[territory.id as keyof typeof ZONE_CONFIG];
    return configured?.center ?? territory.center;
  }

  function zoneRadii(territory: TerritoryRecord) {
    const configured = ZONE_CONFIG[territory.id as keyof typeof ZONE_CONFIG];
    const base = configured?.coreRadius ?? 1500;
    const severityFactor = 0.9 + territory.ivds * 0.45;
    return {
      core: Math.round(base * severityFactor),
      glow: Math.round(base * severityFactor * 1.75)
    };
  }

  function fitToVisible() {
    const map = mapRef.current;
    if (!map || !visibleTerritories.length) return;
    const centers = visibleTerritories.map((territory) => zoneCenter(territory));
    const bounds = L.latLngBounds(centers as [number, number][]);
    map.fitBounds(bounds.pad(0.34), { animate: true, duration: 0.45 });
  }

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      dragging: true,
      keyboard: true
    });
    mapRef.current = map;
    map.setMinZoom(10);
    map.setMaxZoom(15);

    const tile = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd'
    });
    tile.addTo(map);
    tileRef.current = tile;

    fitToVisible();

    return () => {
      Object.values(layerRef.current).forEach(({ glow, core }) => {
        glow.remove();
        core.remove();
      });
      layerRef.current = {};
      tileRef.current?.remove();
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(layerRef.current).forEach(({ glow, core }) => {
      glow.remove();
      core.remove();
    });
    layerRef.current = {};

    visibleTerritories.forEach((territory) => {
      const center = zoneCenter(territory);
      const radius = zoneRadii(territory);
      const isSelected = territory.id === selectedTerritory?.id;

      const glow = L.circle(center, {
        radius: radius.glow,
        ...styleForGlow(territory, isSelected, false)
      });

      const core = L.circle(center, {
        radius: radius.core,
        ...styleForCore(territory, isSelected, false)
      });

      core.bindTooltip(
        `<div class="min-w-[170px]"><div class="text-sm font-semibold" style="color:#0f172a">${territory.name}</div><div class="mt-1 flex items-center justify-between text-xs" style="color:#334155"><span>IVDS</span><span class="font-mono font-semibold" style="color:#0f172a">${territory.ivds.toFixed(2)}</span></div><div class="mt-1 text-[11px]" style="color:#475569">${territory.recommendation.title}</div></div>`,
        { direction: 'top', opacity: 1, sticky: true, className: 'map-hover-tooltip' }
      );

      core.bindPopup(
        `<div class="min-w-[240px]"><div class="text-xs uppercase tracking-[0.2em]" style="color:#64748b">Bairro</div><div class="mt-1 text-lg font-bold" style="color:#0f172a">${territory.name}</div><div class="mt-1 font-mono text-sm" style="color:${LEVEL_CONFIG[territory.level].color}">IVDS ${territory.ivds.toFixed(2)} · ${LEVEL_CONFIG[territory.level].label}</div><div class="mt-3 text-xs" style="color:#334155">Dimensão crítica: <span class="font-semibold" style="color:#0f172a">${territory.dominantDimension.toUpperCase()}</span></div><p class="mt-2 text-xs leading-relaxed" style="color:#475569">${territory.recommendation.title}</p></div>`,
        { closeButton: false, className: 'map-click-popup' }
      );

      core.on('mouseover', () => {
        setHoveredId(territory.id);
        core.bringToFront();
      });

      core.on('mouseout', () => {
        setHoveredId((current) => (current === territory.id ? null : current));
      });

      core.on('click', () => {
        onSelect(territory.id);
      });

      glow.addTo(map);
      core.addTo(map);
      layerRef.current[territory.id] = { glow, core };
    });

    fitToVisible();
  }, [onSelect, selectedTerritory?.id, visibleTerritories]);

  useEffect(() => {
    Object.entries(layerRef.current).forEach(([territoryId, layer]) => {
      const territory = territoryById.get(territoryId);
      if (!territory) return;
      const isSelected = territory.id === selectedTerritory?.id;
      const isHovered = territory.id === hoveredId;
      layer.glow.setStyle(styleForGlow(territory, isSelected, isHovered));
      layer.core.setStyle(styleForCore(territory, isSelected, isHovered));
    });
  }, [hoveredId, selectedTerritory?.id, territoryById]);

  return (
    <div className="relative h-full min-h-[680px] overflow-hidden rounded-[30px] border border-[color:var(--border)] bg-[color:var(--bg-card)] shadow-soft">
      <div className="pointer-events-none absolute inset-0 z-[380] bg-[radial-gradient(circle_at_20%_20%,rgba(87,122,255,0.06),transparent_30%),radial-gradient(circle_at_70%_15%,rgba(20,184,166,0.05),transparent_28%),radial-gradient(circle_at_45%_80%,rgba(249,115,22,0.04),transparent_26%)]" />

      <div className="absolute left-5 top-5 z-[500] max-w-[390px] rounded-2xl border border-[color:var(--border)] bg-[color:rgba(8,16,33,0.72)] px-4 py-3 backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Mapa territorial</p>
        <div className="mt-1 text-sm font-semibold text-[color:var(--text-primary)]">Guarulhos - SP</div>
        <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
          {focusTerritory ? `${focusTerritory.name} · IVDS ${focusTerritory.ivds.toFixed(2)}` : 'Clique em um bairro para análise detalhada'}
        </p>
      </div>

      <div className="absolute right-5 top-5 z-[500] w-[330px] rounded-2xl border border-[color:var(--border)] bg-[color:rgba(8,16,33,0.72)] px-4 py-3 backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Foco operacional</p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-[color:var(--text-primary)]">{focusTerritory?.name ?? 'Sem bairro selecionado'}</div>
            <p className="mt-1 text-xs text-[color:var(--text-secondary)]">{focusTerritory?.recommendation.title ?? 'Selecione um bairro para recomendação'}</p>
          </div>
          {focusTerritory ? (
            <div className="text-right">
              <div className="font-mono text-xl font-bold text-[color:var(--text-primary)]">{focusTerritory.ivds.toFixed(2)}</div>
              <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: LEVEL_CONFIG[focusTerritory.level].color }}>
                {LEVEL_CONFIG[focusTerritory.level].label}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="absolute bottom-5 left-5 z-[500] rounded-2xl border border-[color:var(--border)] bg-[color:rgba(8,16,33,0.72)] px-4 py-3 backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Legenda IVDS</p>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-[color:var(--text-secondary)]">
          {(['critical', 'high', 'medium', 'low'] as const).map((level) => (
            <div key={level} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: LEVEL_CONFIG[level].color }} />
              <span>{LEVEL_CONFIG[level].label}</span>
            </div>
          ))}
        </div>
      </div>

      <div ref={mapContainerRef} className="h-full min-h-[680px] w-full" />
    </div>
  );
}
