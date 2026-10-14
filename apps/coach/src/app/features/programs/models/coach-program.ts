import { FitnessGoal } from '@coach/core/fitness/fitness-goal';
import { ExperienceLevel } from './coach-program-attributes';

export interface WorkoutProgram {
  id: string;
  name: string;
  goal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  isHomeWorkout: boolean;
  isPublished: boolean;
  dayCount: number;
  createdOnUtc: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  goal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  isHomeWorkout: boolean;
}

export interface NewWorkoutProgram {
  name: string;
  goal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  isHomeWorkout: boolean;
}
