import { TranslationKey, TranslationParams } from '@core/i18n/dictionary';
import { daysBetween } from '../format/formats';

export interface ActivityText {
  readonly key: TranslationKey;
  readonly params?: TranslationParams;
}

export function daysSinceWorkout(lastWorkout: Date | null, now: Date): number | null {
  if (lastWorkout === null) {
    return null;
  }
  return Math.max(daysBetween(lastWorkout, now), 0);
}

export function lastWorkoutText(lastWorkout: Date | null, now: Date): ActivityText {
  const days = daysSinceWorkout(lastWorkout, now);
  if (days === null) {
    return { key: 'coachApp.activity.none' };
  }
  if (days === 0) {
    return { key: 'coachApp.activity.today' };
  }
  if (days === 1) {
    return { key: 'coachApp.activity.yesterday' };
  }
  return { key: 'coachApp.activity.daysAgo', params: { days } };
}

export function initialsOf(...parts: readonly (string | null | undefined)[]): string {
  return parts
    .map((part) => part?.trim() ?? '')
    .filter((part) => part.length > 0)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
