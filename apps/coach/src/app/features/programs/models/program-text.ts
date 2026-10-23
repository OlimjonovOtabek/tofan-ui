import { EXPERIENCE_LEVEL_LABELS, placeLabel } from '@coach/core/fitness/experience-level';
import { FITNESS_GOAL_LABELS } from '@coach/core/fitness/fitness-goal';
import { TranslationKey, TranslationParams } from '@core/i18n/dictionary';
import { MealProgram } from './meal-program';
import { WorkoutProgram } from './workout-program';

export type Translate = (key: TranslationKey, params?: TranslationParams) => string;

export function goalText(
  program: { readonly goal: WorkoutProgram['goal'] },
  translate: Translate,
): string | null {
  return program.goal === null ? null : translate(FITNESS_GOAL_LABELS[program.goal]);
}

export function workoutMeta(program: WorkoutProgram, translate: Translate): string {
  return [
    translate('coachApp.programs.daysCount', { count: program.dayCount }),
    program.experienceLevel === null
      ? null
      : translate(EXPERIENCE_LEVEL_LABELS[program.experienceLevel]),
    translate(placeLabel(program.isHomeWorkout)),
  ]
    .filter((part) => part !== null)
    .join(' · ');
}

export function mealProgramTitle(program: MealProgram, translate: Translate): string {
  return (
    program.name || goalText(program, translate) || translate('coachApp.meal.programDetailTitle')
  );
}
