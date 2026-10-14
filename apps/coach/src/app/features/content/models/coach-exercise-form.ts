import {
  EquipmentType,
  ExerciseDifficulty,
  ExerciseGender,
  ExerciseType,
  MuscleGroup,
} from '@shared/models/exercise-attributes';
import { CoachExercise, CoachExerciseDraft } from './coach-exercise';

export interface ExerciseFormValue {
  name: string;
  nameRu: string;
  nameUz: string;
  muscleGroup: MuscleGroup | null;
  equipmentType: EquipmentType | null;
  difficulty: ExerciseDifficulty | null;
  type: ExerciseType | null;
  gender: ExerciseGender | null;
  isCompound: boolean;
  isHomeExercise: boolean;
  instructions: string;
  videoFileId: string | null;
}

export const UNSPECIFIED_MUSCLE_GROUP: MuscleGroup = 'unknown';
export const UNSPECIFIED_EQUIPMENT: EquipmentType = 'none';

export function emptyExerciseForm(videoFileId: string | null): ExerciseFormValue {
  return {
    name: '',
    nameRu: '',
    nameUz: '',
    muscleGroup: null,
    equipmentType: null,
    difficulty: 'beginner',
    type: 'strength',
    gender: 'any',
    isCompound: false,
    isHomeExercise: false,
    instructions: '',
    videoFileId,
  };
}

export function exerciseFormOf(
  exercise: CoachExercise,
  videoFileId: string | null,
): ExerciseFormValue {
  return {
    name: exercise.name,
    nameRu: exercise.nameRu,
    nameUz: exercise.nameUz,
    muscleGroup: exercise.muscleGroup === UNSPECIFIED_MUSCLE_GROUP ? null : exercise.muscleGroup,
    equipmentType: exercise.equipmentType === UNSPECIFIED_EQUIPMENT ? null : exercise.equipmentType,
    difficulty: exercise.difficulty,
    type: exercise.type,
    gender: exercise.gender,
    isCompound: exercise.isCompound,
    isHomeExercise: exercise.isHomeExercise,
    instructions: exercise.instructions ?? '',
    videoFileId,
  };
}

export function toExerciseDraft(value: ExerciseFormValue): CoachExerciseDraft | null {
  const { muscleGroup, equipmentType, difficulty, type, gender } = value;
  if (
    muscleGroup === null ||
    equipmentType === null ||
    difficulty === null ||
    type === null ||
    gender === null
  ) {
    return null;
  }
  return {
    name: value.name.trim(),
    nameRu: value.nameRu.trim(),
    nameUz: value.nameUz.trim(),
    muscleGroup,
    equipmentType,
    difficulty,
    type,
    gender,
    isCompound: value.isCompound,
    isHomeExercise: value.isHomeExercise,
    instructions: value.instructions.trim() || null,
    videoFileId: value.videoFileId,
  };
}
