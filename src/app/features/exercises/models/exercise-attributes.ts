export const MUSCLE_GROUPS = [
  'unknown',
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'obliques',
  'glutes',
  'quadriceps',
  'hamstrings',
  'calves',
  'fullBody',
  'cardio',
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const EQUIPMENT_TYPES = [
  'none',
  'bodyweight',
  'barbell',
  'dumbbell',
  'kettlebell',
  'machine',
  'cable',
  'resistanceBand',
  'bench',
  'pullUpBar',
  'smithMachine',
] as const;
export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];

export const EXERCISE_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
export type ExerciseDifficulty = (typeof EXERCISE_DIFFICULTIES)[number];

export const EXERCISE_TYPES = [
  'strength',
  'cardio',
  'mobility',
  'flexibility',
  'warmUp',
  'coolDown',
] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export const EXERCISE_GENDERS = ['any', 'male', 'female'] as const;
export type ExerciseGender = (typeof EXERCISE_GENDERS)[number];
