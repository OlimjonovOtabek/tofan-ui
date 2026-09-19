import { WeightSource } from './soldier-attributes';
import { roundToTenth } from './soldier-profile';

export interface WeightEntry {
  readonly id: string;
  readonly weightKg: number;
  readonly source: WeightSource;
  readonly note: string | null;
  readonly loggedAt: Date;
}

export interface WeightChange {
  readonly firstKg: number;
  readonly lastKg: number;
  readonly deltaKg: number;
}

export function weightChange(entries: readonly WeightEntry[]): WeightChange | null {
  const first = entries.at(0);
  const last = entries.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }
  return {
    firstKg: first.weightKg,
    lastKg: last.weightKg,
    deltaKg: roundToTenth(last.weightKg - first.weightKg),
  };
}
