import { enumMap } from '@shared/utils/enum-map';
import { FitnessGoal } from './fitness-goal';

export enum FitnessGoalDto {
  LoseWeight = 1,
  GainMuscle = 2,
  Maintain = 3,
  Recomposition = 4,
}

export const fitnessGoals = enumMap<FitnessGoal, FitnessGoalDto>(FitnessGoalDto);
