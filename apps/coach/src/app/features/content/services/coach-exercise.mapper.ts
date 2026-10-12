import {
  difficulties,
  equipmentTypes,
  exerciseTypes,
  genders,
  muscleGroups,
} from '@shared/models/exercise-attributes.dto';
import { CoachExercise, CoachExerciseDraft } from '../models/coach-exercise';
import { CoachExerciseRequest, CoachExerciseResponse } from './coach-content.dto';

export function toCoachExercise(response: CoachExerciseResponse): CoachExercise {
  return {
    ...response,
    muscleGroup: muscleGroups.toDomain(response.muscleGroup),
    equipmentType: equipmentTypes.toDomain(response.equipmentType),
    difficulty: difficulties.toDomain(response.difficulty),
    type: exerciseTypes.toDomain(response.type),
    gender: genders.toDomain(response.gender),
  };
}

export function toCoachExerciseRequest(draft: CoachExerciseDraft): CoachExerciseRequest {
  return {
    ...draft,
    muscleGroup: muscleGroups.toApi(draft.muscleGroup),
    equipmentType: equipmentTypes.toApi(draft.equipmentType),
    difficulty: difficulties.toApi(draft.difficulty),
    type: exerciseTypes.toApi(draft.type),
    gender: genders.toApi(draft.gender),
  };
}
