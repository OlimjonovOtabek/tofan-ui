import { fitnessGoals } from '@coach/core/fitness/fitness-goal.dto';
import { NewWorkoutProgram, WorkoutPlan, WorkoutProgram } from '../models/coach-program';
import { experienceLevels } from './coach-program-attributes.dto';
import {
  CreateWorkoutProgramRequest,
  WorkoutPlanDetails,
  WorkoutProgramSummary,
} from './coach-program.dto';

export function toWorkoutProgram(summary: WorkoutProgramSummary): WorkoutProgram {
  return {
    ...summary,
    goal: fitnessGoals.toDomain(summary.goal),
    experienceLevel: experienceLevels.toDomain(summary.experienceLevel),
  };
}

export function toWorkoutPlan(details: WorkoutPlanDetails): WorkoutPlan {
  return {
    id: details.id,
    name: details.name,
    goal: fitnessGoals.toDomain(details.goal),
    experienceLevel: experienceLevels.toDomain(details.experienceLevel),
    isHomeWorkout: details.isHomeWorkout,
  };
}

export function toCreateWorkoutProgramRequest(program: NewWorkoutProgram): CreateWorkoutProgramRequest {
  return {
    name: program.name,
    goal: fitnessGoals.toApi(program.goal),
    experienceLevel: experienceLevels.toApi(program.experienceLevel),
    isHomeWorkout: program.isHomeWorkout,
  };
}
