import { TranslationKey } from '@core/i18n/dictionary';

export const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, TranslationKey> = {
  beginner: 'coachApp.experience.beginner',
  intermediate: 'coachApp.experience.intermediate',
  advanced: 'coachApp.experience.advanced',
};

export function placeLabel(isHomeWorkout: boolean): TranslationKey {
  return isHomeWorkout ? 'coachApp.place.home' : 'coachApp.place.gym';
}
