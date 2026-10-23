import { ExperienceLevelDto } from '@coach/core/fitness/experience-level.dto';
import { FitnessGoalDto } from '@coach/core/fitness/fitness-goal.dto';
import { MealTypeDto } from '@coach/core/fitness/meal-type.dto';
import { ServingUnitDto } from '@coach/core/fitness/serving-unit.dto';

export interface WorkoutProgramResponse {
  id: string;
  name: string;
  goal: FitnessGoalDto | null;
  experienceLevel: ExperienceLevelDto | null;
  isHomeWorkout: boolean;
  isPublished: boolean;
  dayCount: number;
  createdOnUtc: string;
}

export interface DayExerciseResponse {
  id: string;
  exercise: {
    id: string;
    name: string;
    nameRu: string;
    nameUz: string;
    videoFileId: string | null;
    videoUrl: string | null;
    hlsUrl: string | null;
    posterUrl: string | null;
  } | null;
  displayOrder: number;
}

export interface WorkoutDayResponse {
  id: string;
  title: string | null;
  description: string | null;
  isRestDay: boolean;
  displayOrder: number;
  exercises: DayExerciseResponse[] | null;
}

export interface WorkoutProgramDetailResponse extends Omit<WorkoutProgramResponse, 'dayCount'> {
  days: WorkoutDayResponse[] | null;
  dayCount: number | null;
}

export interface WorkoutProgramVideoInput {
  fileId: string;
  name?: string;
}

export interface WorkoutProgramDayRequest {
  title: string;
  description?: string;
  videos: WorkoutProgramVideoInput[];
}

export interface CreateWorkoutProgramRequest {
  name: string;
  goal: FitnessGoalDto;
  experienceLevel: ExperienceLevelDto;
  isHomeWorkout: boolean;
  days: WorkoutProgramDayRequest[];
}

export type UpdateWorkoutProgramRequest = Omit<CreateWorkoutProgramRequest, 'days'>;

export interface MealProgramResponse {
  id: string;
  name: string | null;
  goal: FitnessGoalDto | null;
  isPublished: boolean;
  mealCount: number;
}

export interface MealItemResponse {
  id: string;
  foodId: string;
  foodName: string | null;
  foodNameRu: string | null;
  foodNameUz: string | null;
  quantity: number | null;
  unit: ServingUnitDto | null;
  quantityGrams: number | null;
  calories: number | null;
  estimatedCost: number | null;
  optionNumber: number | null;
}

export interface MealResponse {
  id: string;
  mealType: MealTypeDto;
  plannedTime: string | null;
  title: string | null;
  displayOrder: number;
  items: MealItemResponse[] | null;
}

export interface MealTotalsResponse {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  estimatedCost: number;
}

export interface MealProgramDetailResponse extends MealProgramResponse {
  meals: MealResponse[] | null;
  totals: MealTotalsResponse | null;
  optionTotals:
    { mealPlanMealId: string; optionNumber: number; totals: MealTotalsResponse }[] | null;
}

export interface MealItemRequest {
  foodId: string;
  quantity: number;
  unit: ServingUnitDto;
  estimatedCost?: number;
  optionNumber: number;
}

export interface MealRequest {
  mealType: MealTypeDto;
  plannedTime?: string;
  title: string;
  displayOrder: number;
  items: MealItemRequest[];
}

export interface MealProgramRequest {
  name: string;
  goal?: FitnessGoalDto;
  meals: MealRequest[];
}

export interface FoodResponse {
  id: string;
  name: string | null;
  nameRu: string | null;
  nameUz: string | null;
  servingUnit: ServingUnitDto | null;
  servingSize: number | null;
  servingSizeGrams: number | null;
  caloriesPerServing: number | null;
}
