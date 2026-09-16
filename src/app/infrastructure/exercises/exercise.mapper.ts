import { Exercise } from '@domain/exercises/entities/exercise';
import {
  EquipmentType,
  ExerciseDifficulty,
  ExerciseGender,
  ExerciseType,
  MuscleGroup,
} from '@domain/exercises/exercise-attributes';
import { ExerciseDraft } from '@domain/exercises/exercise-draft';
import {
  CreateExerciseRequest,
  EquipmentType as ApiEquipmentType,
  ExerciseDifficulty as ApiExerciseDifficulty,
  ExerciseGender as ApiExerciseGender,
  ExerciseResponse,
  ExerciseType as ApiExerciseType,
  MuscleGroup as ApiMuscleGroup,
} from '@infrastructure/api/generated';

/**
 * Domain values are the camelCase spelling of the backend enum members (`fullBody` -> `FullBody`),
 * so the member name is the mapping: no order or number is hard-coded on this side.
 */
export const muscleGroups = enumMap<MuscleGroup, ApiMuscleGroup>(ApiMuscleGroup);
export const equipmentTypes = enumMap<EquipmentType, ApiEquipmentType>(ApiEquipmentType);
export const difficulties = enumMap<ExerciseDifficulty, ApiExerciseDifficulty>(ApiExerciseDifficulty);
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

export interface EnumMap<TDomain extends string, TApi extends number> {
  toApi(value: TDomain): TApi;
  toDomain(value: TApi): TDomain;
}

function enumMap<TDomain extends string, TApi extends number>(
  apiEnum: Record<string, unknown>,
): EnumMap<TDomain, TApi> {
  return {
    toApi: (value) => {
      const member = apiEnum[capitalize(value)];
      if (typeof member !== 'number') {
        throw new Error(`The API enum has no member for '${value}'. Regenerate the API client.`);
      }
      return member as TApi;
    },
    toDomain: (value) => {
      const name = apiEnum[value];
      if (typeof name !== 'string') {
        throw new Error(`The API returned the unknown enum value ${value}.`);
      }
      return uncapitalize(name) as TDomain;
    },
  };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function uncapitalize(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}
