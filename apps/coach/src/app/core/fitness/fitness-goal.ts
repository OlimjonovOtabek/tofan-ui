import { TranslationKey } from '@core/i18n/dictionary';
import { toSelectOptions } from '@shared/models/select-option';

export const FITNESS_GOALS = ['loseWeight', 'gainMuscle', 'maintain', 'recomposition'] as const;
export type FitnessGoal = (typeof FITNESS_GOALS)[number];

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, TranslationKey> = {
  loseWeight: 'coachApp.goals.loseWeight',
  gainMuscle: 'coachApp.goals.gainMuscle',
  maintain: 'coachApp.goals.maintainWeight',
  recomposition: 'coachApp.goals.recomposition',
};

export const FITNESS_GOAL_OPTIONS = toSelectOptions(FITNESS_GOALS, FITNESS_GOAL_LABELS);
