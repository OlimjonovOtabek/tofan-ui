import { LandingKey } from '@landing/core/i18n/landing-dictionary';
import { IconName } from '@landing/shared/icon/icon-name';

export interface Capability {
  readonly icon: IconName;
  readonly title: LandingKey;
  readonly text: LandingKey;
  readonly comingSoon: boolean;
}

export const CAPABILITIES: readonly Capability[] = [
  {
    icon: 'dumbbell',
    title: 'features.workouts.title',
    text: 'features.workouts.text',
    comingSoon: false,
  },
  {
    icon: 'ai',
    title: 'features.aiCoach.title',
    text: 'features.aiCoach.text',
    comingSoon: true,
  },
  {
    icon: 'utensils',
    title: 'features.nutrition.title',
    text: 'features.nutrition.text',
    comingSoon: false,
  },
  {
    icon: 'award',
    title: 'features.trainers.title',
    text: 'features.trainers.text',
    comingSoon: false,
  },
  {
    icon: 'users',
    title: 'features.community.title',
    text: 'features.community.text',
    comingSoon: true,
  },
  {
    icon: 'bag',
    title: 'features.store.title',
    text: 'features.store.text',
    comingSoon: true,
  },
];
