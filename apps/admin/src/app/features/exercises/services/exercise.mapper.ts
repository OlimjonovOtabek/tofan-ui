import { Exercise } from '../models/exercise';
import { ExerciseDraft } from '../models/exercise-draft';
import {
  difficulties,
  equipmentTypes,
  exerciseTypes,
  genders,
  muscleGroups,
} from '@shared/models/exercise-attributes.dto';
import { CreateExerciseRequest, ExerciseResponse } from './exercise.dto';

export function toExercise(response: ExerciseResponse): Exercise {
  return new Exercise(
    response.id,
    { en: response.name, uz: response.nameUz, ru: response.nameRu },
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
