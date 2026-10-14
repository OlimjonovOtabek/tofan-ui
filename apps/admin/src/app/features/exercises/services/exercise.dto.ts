import {
  EquipmentTypeDto,
  ExerciseDifficultyDto,
  ExerciseGenderDto,
  ExerciseTypeDto,
  MuscleGroupDto,
} from '@shared/models/exercise-attributes.dto';

export interface ExerciseResponse {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  muscleGroup: MuscleGroupDto;
  equipmentType: EquipmentTypeDto;
  difficulty: ExerciseDifficultyDto;
  type: ExerciseTypeDto;
  gender: ExerciseGenderDto;
  isCompound: boolean;
  isHomeExercise: boolean;
  isActive: boolean;
  instructions?: string | null;
  videoFileId?: string | null;
}

export interface CreateExerciseRequest {
  name: string;
  nameUz: string;
  nameRu: string;
  muscleGroup: MuscleGroupDto;
  equipmentType: EquipmentTypeDto;
  difficulty: ExerciseDifficultyDto;
  type: ExerciseTypeDto;
  gender: ExerciseGenderDto;
  isCompound: boolean;
  isHomeExercise: boolean;
  instructions?: string | null;
  videoFileId?: string | null;
}
