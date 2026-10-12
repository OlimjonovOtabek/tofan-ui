import { Weekday, WorkoutSplit } from './coach-program-attributes';

export interface WorkoutDayExerciseDraft {
  key: string;
  exerciseId: string;
  name: string;
  nameRu: string;
  nameUz: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  targetWeightKg: number | null;
}

export interface WorkoutDayDraft {
  key: string;
  id: string | null;
  workoutPlanId: string;
  dayOfWeek: Weekday;
  splitType: WorkoutSplit;
  title: string;
  isRestDay: boolean;
  displayOrder: number;
  exercises: readonly WorkoutDayExerciseDraft[];
}

export interface WorkoutDaySettings {
  title: string;
  dayOfWeek: Weekday;
  splitType: WorkoutSplit;
  isRestDay: boolean;
}

export interface WorkoutExerciseChoice {
  id: string;
  name: string;
  nameRu: string;
  nameUz: string;
}

export type WorkoutDraftIssue = 'dayTitle' | 'exercise';

export type WorkoutDaySaveState = 'saved' | 'failed';

const DEFAULT_REST_SECONDS = 60;
const DEFAULT_SETS = 3;
const DEFAULT_REPS = '8-12';
const MIN_SETS = 1;

export function newWorkoutDay(
  key: string,
  workoutPlanId: string,
  displayOrder: number,
  settings: WorkoutDaySettings,
): WorkoutDayDraft {
  return {
    key,
    id: null,
    workoutPlanId,
    dayOfWeek: settings.dayOfWeek,
    splitType: settings.splitType,
    title: settings.title.trim(),
    isRestDay: settings.isRestDay,
    displayOrder,
    exercises: [],
  };
}

export function newWorkoutExercise(key: string, exercise: WorkoutExerciseChoice): WorkoutDayExerciseDraft {
  return {
    key,
    exerciseId: exercise.id,
    name: exercise.name,
    nameRu: exercise.nameRu,
    nameUz: exercise.nameUz,
    targetSets: DEFAULT_SETS,
    targetReps: DEFAULT_REPS,
    restSeconds: DEFAULT_REST_SECONDS,
    targetWeightKg: null,
  };
}

export function workoutDraftIssue(days: readonly WorkoutDayDraft[]): WorkoutDraftIssue | null {
  if (days.some((day) => day.title.trim().length === 0)) {
    return 'dayTitle';
  }
  const invalidExercise = days.some((day) => day.exercises.some(isInvalidExercise));
  return invalidExercise ? 'exercise' : null;
}

function isInvalidExercise(exercise: WorkoutDayExerciseDraft): boolean {
  return !(exercise.targetSets >= MIN_SETS) || exercise.targetReps.trim().length === 0;
}
