import { enumMap } from '@shared/utils/enum-map';
import {
  EquipmentType,
  ExerciseDifficulty,
  ExerciseGender,
  ExerciseType,
  MuscleGroup,
} from './exercise-attributes';

export enum MuscleGroupDto {
  Unknown = 0,
  Chest = 1,
  Back = 2,
  Shoulders = 3,
  Biceps = 4,
  Triceps = 5,
  Forearms = 6,
  Abs = 7,
  Obliques = 8,
  Glutes = 9,
  Quadriceps = 10,
  Hamstrings = 11,
  Calves = 12,
  FullBody = 13,
  Cardio = 14,
}

export enum EquipmentTypeDto {
  None = 0,
  Bodyweight = 1,
  Barbell = 2,
  Dumbbell = 3,
  Kettlebell = 4,
  Machine = 5,
  Cable = 6,
  ResistanceBand = 7,
  Bench = 8,
  PullUpBar = 9,
  SmithMachine = 10,
}

export enum ExerciseDifficultyDto {
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3,
}

export enum ExerciseTypeDto {
  Strength = 1,
  Cardio = 2,
  Mobility = 3,
  Flexibility = 4,
  WarmUp = 5,
  CoolDown = 6,
}

export enum ExerciseGenderDto {
  Any = 0,
  Male = 1,
  Female = 2,
}

export const muscleGroups = enumMap<MuscleGroup, MuscleGroupDto>(MuscleGroupDto);
export const equipmentTypes = enumMap<EquipmentType, EquipmentTypeDto>(EquipmentTypeDto);
export const difficulties = enumMap<ExerciseDifficulty, ExerciseDifficultyDto>(ExerciseDifficultyDto);
export const exerciseTypes = enumMap<ExerciseType, ExerciseTypeDto>(ExerciseTypeDto);
export const genders = enumMap<ExerciseGender, ExerciseGenderDto>(ExerciseGenderDto);
