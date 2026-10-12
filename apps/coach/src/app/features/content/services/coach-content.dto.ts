import {
  EquipmentTypeDto,
  ExerciseDifficultyDto,
  ExerciseGenderDto,
  ExerciseTypeDto,
  MuscleGroupDto,
} from '@shared/models/exercise-attributes.dto';

export interface CoachExerciseResponse {
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
  instructions: string | null;
  videoFileId: string | null;
}

export type CoachExerciseRequest = Omit<CoachExerciseResponse, 'id' | 'isActive'>;

export interface CoachFoodSummary {
  id: string;
  userId: string;
  name: string;
  caloriesPerServing: number;
  servingSizeGrams: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number | null;
  createdOnUtc: string;
}

export interface CoachFoodRequest {
  name: string;
  servingSizeGrams: number;
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number | null;
}
