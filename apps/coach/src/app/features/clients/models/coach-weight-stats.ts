import { CoachWeightPoint } from '../services/coach-client-detail.dto';

export interface WeightStats {
  first: number;
  last: number;
  change: number;
  count: number;
}

export interface WeightRow {
  point: CoachWeightPoint;
  delta: number | null;
}

export function sortedByLogTime(points: readonly CoachWeightPoint[]): CoachWeightPoint[] {
  return [...points].sort((left, right) => left.loggedOnUtc.localeCompare(right.loggedOnUtc));
}

export function weightStats(points: readonly CoachWeightPoint[]): WeightStats | null {
  const ordered = sortedByLogTime(points);
  if (ordered.length === 0) {
    return null;
  }
  const first = ordered[0].weightKg;
  const last = ordered[ordered.length - 1].weightKg;
  return { first, last, change: last - first, count: ordered.length };
}

export function recentWeightRows(points: readonly CoachWeightPoint[], limit: number): WeightRow[] {
  const ordered = sortedByLogTime(points);
  return ordered
    .map((point, index) => ({
      point,
      delta: index === 0 ? null : point.weightKg - ordered[index - 1].weightKg,
    }))
    .reverse()
    .slice(0, limit);
}
