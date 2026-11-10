export type DayRange = readonly (Date | null)[] | null;

export interface DayPeriod {
  readonly from?: Date;
  readonly before?: Date;
}

export function toDayPeriod(range: DayRange): DayPeriod {
  const [firstDay = null, lastDay = null] = range ?? [];
  const closingDay = lastDay ?? firstDay;
  return {
    ...(firstDay === null ? {} : { from: dayStart(firstDay, 0) }),
    ...(closingDay === null ? {} : { before: dayStart(closingDay, 1) }),
  };
}

function dayStart(day: Date, offsetDays: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + offsetDays);
}
