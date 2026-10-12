import { CoachAdherenceDay } from '../models/coach-client';

export type AdherenceDayKind = 'completed' | 'missed' | 'rest' | 'planned';

const DAYS_IN_WEEK = 7;
const SUNDAY_BASED_TO_MONDAY_BASED = 6;

export function adherenceDayKind(day: CoachAdherenceDay): AdherenceDayKind {
  if (day.isRestDay) {
    return 'rest';
  }
  if (day.isMissed) {
    return 'missed';
  }
  return day.sessionStatus === 'completed' ? 'completed' : 'planned';
}

export function mondayBasedWeekday(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  return (new Date(year, month - 1, day).getDay() + SUNDAY_BASED_TO_MONDAY_BASED) % DAYS_IN_WEEK;
}
