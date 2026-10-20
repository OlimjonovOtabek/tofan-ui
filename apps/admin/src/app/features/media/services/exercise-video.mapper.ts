import { ExerciseChoice } from '../models/exercise-choice';
import { ExerciseResponse, UpdateExerciseRequest } from './exercise-video.dto';

export function hasNoVideo(response: ExerciseResponse): boolean {
  return response.videoFileId === undefined || response.videoFileId === null;
}

export function toSignedVideoUrls(
  responses: readonly ExerciseResponse[],
  apiUrlOf: (path: string) => string,
): ReadonlyMap<string, string> {
  const urls = new Map<string, string>();
  for (const { videoFileId, videoUrl } of responses) {
    if (videoFileId && videoUrl) {
      urls.set(videoFileId, apiUrlOf(videoUrl));
    }
  }
  return urls;
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
