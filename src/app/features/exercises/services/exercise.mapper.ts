import { Exercise } from '../models/exercise';
import {
  EquipmentType,
  ExerciseDifficulty,
  ExerciseGender,
  ExerciseType,
  MuscleGroup,
} from '../models/exercise-attributes';
import { ExerciseDraft } from '../models/exercise-draft';
import { enumMap } from '@shared/utils/enum-map';
import {
  CreateExerciseRequest,
  EquipmentType as ApiEquipmentType,
  ExerciseDifficulty as ApiExerciseDifficulty,
  ExerciseGender as ApiExerciseGender,
  ExerciseResponse,
  ExerciseType as ApiExerciseType,
  MuscleGroup as ApiMuscleGroup,
} from './exercise.dto';

export const muscleGroups = enumMap<MuscleGroup, ApiMuscleGroup>(ApiMuscleGroup);
export const equipmentTypes = enumMap<EquipmentType, ApiEquipmentType>(ApiEquipmentType);
export const difficulties = enumMap<ExerciseDifficulty, ApiExerciseDifficulty>(
  ApiExerciseDifficulty,
);
export const exerciseTypes = enumMap<ExerciseType, ApiExerciseType>(ApiExerciseType);
export const genders = enumMap<ExerciseGender, ApiExerciseGender>(ApiExerciseGender);

export function toExercise(response: ExerciseResponse): Exercise {
  return new Exercise(
    response.id,
    response.name,
    response.nameUz,
    response.nameRu,
    muscleGroups.toDomain(response.muscleGroup),
    equipmentTypes.toDomain(response.equipmentType),
    difficulties.toDomain(response.difficulty),
    exerciseTypes.toDomain(response.type),
    genders.toDomain(response.gender),
    response.isCompound,
    response.isHomeExercise,
    response.isActive,
    response.instructions ?? null,
    response.videoFileId ?? null,
  );
}

export function toCreateExerciseRequest(draft: ExerciseDraft): CreateExerciseRequest {
  return {
    name: draft.name,
    nameUz: draft.nameUz,
    nameRu: draft.nameRu,
    muscleGroup: muscleGroups.toApi(draft.muscleGroup),
    equipmentType: equipmentTypes.toApi(draft.equipmentType),
    difficulty: difficulties.toApi(draft.difficulty),
    type: exerciseTypes.toApi(draft.type),
    gender: genders.toApi(draft.gender),
    isCompound: draft.isCompound,
    isHomeExercise: draft.isHomeExercise,
    ...(draft.instructions === null ? {} : { instructions: draft.instructions }),
    ...(draft.videoFileId === null ? {} : { videoFileId: draft.videoFileId }),
  };
}
