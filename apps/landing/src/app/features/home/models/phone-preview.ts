import { LandingKey } from '@landing/core/i18n/landing-dictionary';
import { IconName } from '@landing/shared/icon/icon-name';

export interface PhoneStat {
  readonly value: LandingKey;
  readonly label: LandingKey;
}

export interface PhonePlanItem {
  readonly icon: IconName;
  readonly title: LandingKey;
  readonly text: LandingKey;
}

export const PHONE_STATS: readonly PhoneStat[] = [
  { value: 'phone.steps', label: 'phone.stepsLabel' },
  { value: 'phone.calories', label: 'phone.caloriesLabel' },
  { value: 'phone.weight', label: 'phone.weightLabel' },
];

export const PHONE_PLAN: readonly PhonePlanItem[] = [
  { icon: 'dumbbell', title: 'phone.workoutTitle', text: 'phone.workoutText' },
  { icon: 'utensils', title: 'phone.mealTitle', text: 'phone.mealText' },
];
