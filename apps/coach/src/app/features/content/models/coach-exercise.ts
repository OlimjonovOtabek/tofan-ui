import {
  EquipmentType,
  ExerciseDifficulty,
  ExerciseGender,
  ExerciseType,
  MuscleGroup,
} from '@shared/models/exercise-attributes';

export interface CoachExercise {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  muscleGroup: MuscleGroup;
  equipmentType: EquipmentType;
  difficulty: ExerciseDifficulty;
  type: ExerciseType;
  gender: ExerciseGender;
  isCompound: boolean;
  isHomeExercise: boolean;
  isActive: boolean;
  instructions: string | null;
  videoFileId: string | null;
}

export type CoachExerciseDraft = Omit<CoachExercise, 'id' | 'isActive'>;
