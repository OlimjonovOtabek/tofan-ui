export function toUtcCalendarDate(date: Date): string {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
}

export function fromUtcCalendarDate(value: string): Date {
  const date = new Date(value);
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isAfterDay(date: Date, reference: Date): boolean {
  return startOfDay(date).getTime() > startOfDay(reference).getTime();
}
