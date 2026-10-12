export const REPORT_PERIOD_DAYS = [7, 14, 30] as const;

export type ReportPeriodDays = (typeof REPORT_PERIOD_DAYS)[number];

export interface ReportRange {
  from: string;
  to: string;
}

const ISO_PART_LENGTH = 2;
const END_OF_DAY = { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 } as const;

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(ISO_PART_LENGTH, '0');
  const day = String(date.getDate()).padStart(ISO_PART_LENGTH, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(isoDate: string, amount: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return toIsoDate(date);
}

export function periodRange(days: number, now: Date): ReportRange {
  const to = toIsoDate(now);
  return { from: addDays(to, 1 - days), to };
}

export function matchingPeriod(range: ReportRange, now: Date): ReportPeriodDays | null {
  return (
    REPORT_PERIOD_DAYS.find((days) => {
      const preset = periodRange(days, now);
      return preset.from === range.from && preset.to === range.to;
    }) ?? null
  );
}

export function localDayStart(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toISOString();
}

export function localDayEnd(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(END_OF_DAY.hours, END_OF_DAY.minutes, END_OF_DAY.seconds, END_OF_DAY.milliseconds);
  return date.toISOString();
}
