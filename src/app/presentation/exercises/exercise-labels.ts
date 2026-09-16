import {
  EQUIPMENT_TYPES,
  EXERCISE_DIFFICULTIES,
  EXERCISE_GENDERS,
  EXERCISE_TYPES,
  EquipmentType,
  ExerciseDifficulty,
  ExerciseGender,
  ExerciseType,
  MUSCLE_GROUPS,
  MuscleGroup,
} from '@domain/exercises/exercise-attributes';
import { toSelectOptions } from '@presentation/shared/forms/select-option';

/** Uzbek wording for the catalog classifiers; the domain keeps the values language-free. */
export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  unknown: "Noma'lum",
  chest: "Ko'krak",
  back: 'Orqa',
  shoulders: 'Yelka',
  biceps: 'Bitseps',
  triceps: 'Tritseps',
  forearms: 'Bilak',
  abs: 'Qorin',
  obliques: 'Yon qorin',
  glutes: 'Dumba',
  quadriceps: 'Son (old)',
  hamstrings: 'Son (orqa)',
  calves: 'Boldir',
  fullBody: "To'liq tana",
  cardio: 'Kardio',
};

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  none: "Jihoz yo'q",
  bodyweight: "O'z vazni",
  barbell: 'Shtanga',
  dumbbell: 'Gantel',
  kettlebell: 'Girya',
  machine: 'Trenajyor',
  cable: 'Blok (tros)',
  resistanceBand: 'Rezina lenta',
  bench: 'Skameyka',
  pullUpBar: 'Turnik',
  smithMachine: 'Smit mashinasi',
};

export const DIFFICULTY_LABELS: Record<ExerciseDifficulty, string> = {
  beginner: "Boshlang'ich",
  intermediate: "O'rta",
  advanced: 'Yuqori',
};

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  strength: 'Kuch',
  cardio: 'Kardio',
  mobility: 'Harakatchanlik',
  flexibility: 'Egiluvchanlik',
  warmUp: 'Isinish',
  coolDown: 'Sovish',
};

export const GENDER_LABELS: Record<ExerciseGender, string> = {
  any: "Farqi yo'q",
  male: 'Erkak',
  female: 'Ayol',
};

export const MUSCLE_GROUP_OPTIONS = toSelectOptions(MUSCLE_GROUPS, MUSCLE_GROUP_LABELS);
export const EQUIPMENT_TYPE_OPTIONS = toSelectOptions(EQUIPMENT_TYPES, EQUIPMENT_TYPE_LABELS);
export const DIFFICULTY_OPTIONS = toSelectOptions(EXERCISE_DIFFICULTIES, DIFFICULTY_LABELS);
export const EXERCISE_TYPE_OPTIONS = toSelectOptions(EXERCISE_TYPES, EXERCISE_TYPE_LABELS);
export const GENDER_OPTIONS = toSelectOptions(EXERCISE_GENDERS, GENDER_LABELS);
