import {
  EquipmentTypeDto,
  ExerciseDifficultyDto,
  ExerciseGenderDto,
  ExerciseTypeDto,
  MuscleGroupDto,
} from '@shared/models/exercise-attributes.dto';
import { FoodSourceDto, ServingUnitDto } from './coach-program-attributes.dto';

export interface LibraryExercise {
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

export interface CatalogFood {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  servingSizeGrams: number;
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number | null;
  source: FoodSourceDto;
  servingUnit: ServingUnitDto;
  isVerified: boolean;
  isActive: boolean;
  isFavorite: boolean;
  isMine: boolean;
}

export interface OwnFood {
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
