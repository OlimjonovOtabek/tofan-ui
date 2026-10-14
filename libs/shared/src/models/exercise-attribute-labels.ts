import { TranslationKey } from '@core/i18n/dictionary';
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
} from './exercise-attributes';
import { toSelectOptions } from '@shared/models/select-option';

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, TranslationKey> = {
  unknown: 'enums.muscleGroup.unknown',
  chest: 'enums.muscleGroup.chest',
  back: 'enums.muscleGroup.back',
  shoulders: 'enums.muscleGroup.shoulders',
  biceps: 'enums.muscleGroup.biceps',
  triceps: 'enums.muscleGroup.triceps',
  forearms: 'enums.muscleGroup.forearms',
  abs: 'enums.muscleGroup.abs',
  obliques: 'enums.muscleGroup.obliques',
  glutes: 'enums.muscleGroup.glutes',
  quadriceps: 'enums.muscleGroup.quadriceps',
  hamstrings: 'enums.muscleGroup.hamstrings',
  calves: 'enums.muscleGroup.calves',
  fullBody: 'enums.muscleGroup.fullBody',
  cardio: 'enums.muscleGroup.cardio',
};

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, TranslationKey> = {
  none: 'enums.equipmentType.none',
  bodyweight: 'enums.equipmentType.bodyweight',
  barbell: 'enums.equipmentType.barbell',
  dumbbell: 'enums.equipmentType.dumbbell',
  kettlebell: 'enums.equipmentType.kettlebell',
  machine: 'enums.equipmentType.machine',
  cable: 'enums.equipmentType.cable',
  resistanceBand: 'enums.equipmentType.resistanceBand',
  bench: 'enums.equipmentType.bench',
  pullUpBar: 'enums.equipmentType.pullUpBar',
  smithMachine: 'enums.equipmentType.smithMachine',
};

export const DIFFICULTY_LABELS: Record<ExerciseDifficulty, TranslationKey> = {
  beginner: 'enums.difficulty.beginner',
  intermediate: 'enums.difficulty.intermediate',
  advanced: 'enums.difficulty.advanced',
};

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, TranslationKey> = {
  strength: 'enums.exerciseType.strength',
  cardio: 'enums.exerciseType.cardio',
  mobility: 'enums.exerciseType.mobility',
  flexibility: 'enums.exerciseType.flexibility',
  warmUp: 'enums.exerciseType.warmUp',
  coolDown: 'enums.exerciseType.coolDown',
};

export const GENDER_LABELS: Record<ExerciseGender, TranslationKey> = {
  any: 'enums.gender.any',
  male: 'enums.gender.male',
  female: 'enums.gender.female',
};

export const MUSCLE_GROUP_OPTIONS = toSelectOptions(MUSCLE_GROUPS, MUSCLE_GROUP_LABELS);
export const EQUIPMENT_TYPE_OPTIONS = toSelectOptions(EQUIPMENT_TYPES, EQUIPMENT_TYPE_LABELS);
export const DIFFICULTY_OPTIONS = toSelectOptions(EXERCISE_DIFFICULTIES, DIFFICULTY_LABELS);
export const EXERCISE_TYPE_OPTIONS = toSelectOptions(EXERCISE_TYPES, EXERCISE_TYPE_LABELS);
export const GENDER_OPTIONS = toSelectOptions(EXERCISE_GENDERS, GENDER_LABELS);
