import { ValidationError } from '@shared/models/errors/validation.error';
import {
  EquipmentType,
  ExerciseDifficulty,
  ExerciseGender,
  ExerciseType,
  MuscleGroup,
} from './exercise-attributes';

export interface ExerciseDraft {
  readonly name: string;
  readonly nameUz: string;
  readonly nameRu: string;
  readonly muscleGroup: MuscleGroup;
  readonly equipmentType: EquipmentType;
  readonly difficulty: ExerciseDifficulty;
  readonly type: ExerciseType;
  readonly gender: ExerciseGender;
  readonly isCompound: boolean;
  readonly isHomeExercise: boolean;
  readonly instructions: string | null;
  readonly videoFileId: string | null;
}

export function createExerciseDraft(draft: ExerciseDraft): ExerciseDraft {
  const name = draft.name.trim();
  const nameUz = draft.nameUz.trim();
  const nameRu = draft.nameRu.trim();
  const instructions = draft.instructions?.trim() ?? '';

  const missing = [
    ...(name.length === 0 ? [{ code: 'Name.Empty', message: 'Name is required.' }] : []),
    ...(nameUz.length === 0 ? [{ code: 'NameUz.Empty', message: 'Uzbek name is required.' }] : []),
    ...(nameRu.length === 0
      ? [{ code: 'NameRu.Empty', message: 'Russian name is required.' }]
      : []),
  ];
  if (missing.length > 0) {
    throw new ValidationError('The exercise name is required in every language.', missing);
  }

  return {
    ...draft,
    name,
    nameUz,
    nameRu,
    instructions: instructions.length === 0 ? null : instructions,
  };
}
