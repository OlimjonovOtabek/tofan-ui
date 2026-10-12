export interface WeightChartSize {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface WeightChartEntry {
  loggedDate: string;
  weightKg: number;
}

export interface WeightChart {
  grid: readonly { y: number; value: number }[];
  dots: readonly { x: number; y: number }[];
  labels: readonly { x: number; date: string }[];
  line: string;
  area: string;
  goalY: number | null;
}

const RANGE_PADDING_KG = 0.5;
const MAX_DATE_LABELS = 9;

export function buildWeightChart(
  entries: readonly WeightChartEntry[],
  targetKg: number | null,
  size: WeightChartSize,
): WeightChart | null {
  if (entries.length === 0) {
    return null;
  }
  const values = entries.map((entry) => entry.weightKg);
  const low = Math.floor(Math.min(...values) - RANGE_PADDING_KG);
  const high = Math.ceil(Math.max(...values) + RANGE_PADDING_KG);
  const plotWidth = size.right - size.left;
  const plotHeight = size.bottom - size.top;
  const xOf = (index: number): number =>
    entries.length === 1 ? size.left + plotWidth / 2 : size.left + (index * plotWidth) / (entries.length - 1);
  const yOf = (value: number): number => size.bottom - ((value - low) / (high - low)) * plotHeight;
  const dots = entries.map((entry, index) => ({ x: xOf(index), y: yOf(entry.weightKg) }));
  const line = dots.map((dot) => `${dot.x},${dot.y}`).join(' ');
  const labelStep = Math.ceil(entries.length / MAX_DATE_LABELS);
  return {
    grid: Array.from({ length: high - low + 1 }, (_, index) => ({ value: low + index, y: yOf(low + index) })),
    dots,
    labels: entries
      .map((entry, index) => ({ x: xOf(index), date: entry.loggedDate, index }))
      .filter((label) => label.index % labelStep === 0)
      .map(({ x, date }) => ({ x, date })),
    line,
    area: `${dots[0].x},${size.bottom} ${line} ${dots[dots.length - 1].x},${size.bottom}`,
    goalY: targetKg !== null && targetKg >= low && targetKg <= high ? yOf(targetKg) : null,
  };
}
