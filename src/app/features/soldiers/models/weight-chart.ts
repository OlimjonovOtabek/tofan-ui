import { WeightEntry } from './weight-entry';

export interface ChartArea {
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

export interface ChartPoint {
  readonly x: number;
  readonly y: number;
  readonly entry: WeightEntry;
}

export interface WeightChart {
  readonly points: readonly ChartPoint[];
  readonly path: string;
  readonly minKg: number;
  readonly maxKg: number;
  readonly targetY: number | null;
}

type Scale = (entry: WeightEntry, index: number) => number;

const MARGIN_KG = 1;

export function toWeightChart(
  entries: readonly WeightEntry[],
  targetKg: number | null,
  area: ChartArea,
): WeightChart | null {
  if (entries.length === 0) {
    return null;
  }
  const weights = entries.map((entry) => entry.weightKg);
  const minKg = Math.floor(Math.min(...weights, targetKg ?? Infinity) - MARGIN_KG);
  const maxKg = Math.ceil(Math.max(...weights, targetKg ?? -Infinity) + MARGIN_KG);
  const plotHeight = area.height - area.top - area.bottom;
  const toY = (kg: number): number => area.top + ((maxKg - kg) / (maxKg - minKg)) * plotHeight;
  const toX = timeScale(entries, area);
  const points = entries.map((entry, index) => ({
    x: toX(entry, index),
    y: toY(entry.weightKg),
    entry,
  }));
  return {
    points,
    path: points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' '),
    minKg,
    maxKg,
    targetY: targetKg === null ? null : toY(targetKg),
  };
}

function timeScale(entries: readonly WeightEntry[], area: ChartArea): Scale {
  const plotWidth = area.width - area.left - area.right;
  const times = entries.map((entry) => entry.loggedAt.getTime());
  const start = Math.min(...times);
  const span = Math.max(...times) - start;
  if (span > 0) {
    return (entry) => area.left + ((entry.loggedAt.getTime() - start) / span) * plotWidth;
  }
  if (entries.length === 1) {
    return () => area.left + plotWidth / 2;
  }
  return (_entry, index) => area.left + (plotWidth * index) / (entries.length - 1);
}
