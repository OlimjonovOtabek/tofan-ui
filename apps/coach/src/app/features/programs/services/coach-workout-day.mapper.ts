import { WorkoutDayDraft, WorkoutDayExerciseDraft } from '../models/coach-workout-draft';
import { weekdays, workoutSplits } from './coach-program-attributes.dto';
import {
  CreateWorkoutPlanDayRequest,
  UpdateWorkoutPlanDayRequest,
  WorkoutPlanDay,
} from './coach-program.dto';

export function toWorkoutDayDraft(day: WorkoutPlanDay): WorkoutDayDraft {
  return {
    key: day.id,
    id: day.id,
    workoutPlanId: day.workoutPlanId,
    dayOfWeek: weekdays.toDomain(day.dayOfWeek),
    splitType: workoutSplits.toDomain(day.splitType),
    title: day.title,
    isRestDay: day.isRestDay,
    displayOrder: day.displayOrder,
    exercises: day.exercises.map((exercise) => ({
      key: exercise.id,
      exerciseId: exercise.exercise.id,
      name: exercise.exercise.name,
      nameRu: exercise.exercise.nameRu,
      nameUz: exercise.exercise.nameUz,
      targetSets: exercise.targetSets,
      targetReps: exercise.targetReps,
      restSeconds: exercise.restSeconds,
      targetWeightKg: exercise.targetWeightKg,
    })),
  };
}

export function toCreateDayRequest(day: WorkoutDayDraft): CreateWorkoutPlanDayRequest {
  return { workoutPlanId: day.workoutPlanId, ...toUpdateDayRequest(day) };
}

export function toUpdateDayRequest(day: WorkoutDayDraft): UpdateWorkoutPlanDayRequest {
  return {
    dayOfWeek: weekdays.toApi(day.dayOfWeek),
    splitType: workoutSplits.toApi(day.splitType),
    title: day.title,
    isRestDay: day.isRestDay,
    displayOrder: day.displayOrder,
    exercises: day.exercises.map(toExerciseRequest),
  };
}

function toExerciseRequest(exercise: WorkoutDayExerciseDraft) {
  return {
    exerciseId: exercise.exerciseId,
    targetSets: exercise.targetSets,
    targetReps: exercise.targetReps,
    restSeconds: exercise.restSeconds,
    targetWeightKg: exercise.targetWeightKg,
  };
}
