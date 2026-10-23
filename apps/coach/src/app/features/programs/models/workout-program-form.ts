import { ExperienceLevel } from '@coach/core/fitness/experience-level';
import { FitnessGoal } from '@coach/core/fitness/fitness-goal';
import { WorkoutProgramDetail } from './workout-program';

export interface WorkoutProgramForm {
  readonly name: string;
  readonly goal: FitnessGoal | null;
  readonly experienceLevel: ExperienceLevel;
  readonly isHomeWorkout: boolean;
}

export const NEW_WORKOUT_PROGRAM: WorkoutProgramForm = {
  name: '',
  goal: null,
  experienceLevel: 'intermediate',
  isHomeWorkout: false,
};

export function workoutProgramFormOf(program: WorkoutProgramDetail): WorkoutProgramForm {
  return {
    name: program.name,
    goal: program.goal,
    experienceLevel: program.experienceLevel ?? 'intermediate',
    isHomeWorkout: program.isHomeWorkout,
  };
}

export function canSubmitWorkoutProgram(form: WorkoutProgramForm): boolean {
  return form.name.trim().length > 0 && form.goal !== null;
}
