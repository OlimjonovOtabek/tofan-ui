import { ExerciseChoice } from '../models/exercise-choice';
import { ExerciseResponse, UpdateExerciseRequest } from './exercise-video.dto';

export function hasNoVideo(response: ExerciseResponse): boolean {
  return response.videoFileId === undefined || response.videoFileId === null;
}

export function toExerciseChoice(response: ExerciseResponse): ExerciseChoice {
  return {
    id: response.id,
    names: { en: response.name, uz: response.nameUz, ru: response.nameRu },
    isActive: response.isActive,
  };
}

export function toVideoUpdateRequest(
  response: ExerciseResponse,
  videoFileId: string,
): UpdateExerciseRequest {
  return {
    name: response.name,
    nameUz: response.nameUz,
    nameRu: response.nameRu,
    muscleGroup: response.muscleGroup,
    equipmentType: response.equipmentType,
    difficulty: response.difficulty,
    type: response.type,
    gender: response.gender,
    isCompound: response.isCompound,
    isHomeExercise: response.isHomeExercise,
    instructions: response.instructions ?? null,
    videoFileId,
  };
}
