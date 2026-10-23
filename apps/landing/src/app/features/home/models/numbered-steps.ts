import { LandingKey } from '@landing/core/i18n/landing-dictionary';

export interface NumberedStep {
  readonly title: LandingKey;
  readonly text: LandingKey;
}

export const START_STEPS: readonly NumberedStep[] = [
  { title: 'steps.signUp.title', text: 'steps.signUp.text' },
  { title: 'steps.goal.title', text: 'steps.goal.text' },
  { title: 'steps.progress.title', text: 'steps.progress.text' },
];

export const COACH_STEPS: readonly NumberedStep[] = [
  { title: 'coaches.contactStep.title', text: 'coaches.contactStep.text' },
  { title: 'coaches.accountStep.title', text: 'coaches.accountStep.text' },
  { title: 'coaches.courseStep.title', text: 'coaches.courseStep.text' },
];
