import { FitnessGoalDto } from '@coach/core/fitness/fitness-goal.dto';
import { MealTypeDto } from '@coach/core/fitness/meal-type.dto';
import {
  DayOfWeekDto,
  FitnessExperienceLevelDto,
  WorkoutPlanSourceDto,
  WorkoutSplitTypeDto,
} from './coach-program-attributes.dto';

export interface WorkoutProgramSummary {
  id: string;
  name: string;
  goal: FitnessGoalDto;
  experienceLevel: FitnessExperienceLevelDto;
  isHomeWorkout: boolean;
  isPublished: boolean;
  dayCount: number;
  createdOnUtc: string;
}

export interface MealProgramSummary {
  id: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  mealCount: number;
  createdOnUtc: string;
}

export interface CreateWorkoutProgramRequest {
  name: string;
  goal: FitnessGoalDto;
  experienceLevel: FitnessExperienceLevelDto;
  isHomeWorkout: boolean;
}

export interface CreateMealProgramRequest {
  startDate: string;
  endDate: string;
  meals: readonly CreateMealProgramMeal[];
}

export interface CreateMealProgramBody extends CreateMealProgramRequest {
  name: string;
}

export interface CreateMealProgramMeal {
  mealType: MealTypeDto;
  plannedTime: string | null;
  title: string;
  displayOrder: number;
  items: readonly CreateMealProgramItem[];
}

export interface CreateMealProgramItem {
  foodId: string;
  quantityGrams: number;
  estimatedCost: number | null;
}

export interface MealProgramDetails {
  id: string;
  name: string | null;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  createdOnUtc: string;
  meals: readonly MealProgramMeal[];
}

export interface MealProgramMeal {
  id: string;
  mealPlanId: string;
  mealType: MealTypeDto;
  plannedTime: string | null;
  title: string;
  displayOrder: number;
  items: readonly MealProgramItem[];
}

export interface MealProgramItem {
  id: string;
  mealPlanMealId: string;
  foodId: string;
  foodName: string;
  foodNameRu: string;
  foodNameUz: string;
  quantityGrams: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  estimatedCost: number | null;
}

export interface UpdateMealProgramRequest {
  name: string;
  startDate: string;
  endDate: string;
  meals: readonly CreateMealProgramMeal[];
}

export interface WorkoutPlanDetails {
  id: string;
  userId: string;
  name: string;
  goal: FitnessGoalDto;
  experienceLevel: FitnessExperienceLevelDto;
  source: WorkoutPlanSourceDto;
  isHomeWorkout: boolean;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  isCustomized: boolean;
  createdOnUtc: string;
}

export interface WorkoutPlanDay {
  id: string;
  workoutPlanId: string;
  dayOfWeek: DayOfWeekDto;
  splitType: WorkoutSplitTypeDto;
  title: string;
  isRestDay: boolean;
  displayOrder: number;
  exercises: readonly WorkoutDayExercise[];
}

export interface WorkoutDayExercise {
  id: string;
  exercise: {
    id: string;
    name: string;
    nameRu: string;
    nameUz: string;
  };
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  targetWeightKg: number | null;
  displayOrder: number;
}

export interface CreateWorkoutPlanDayRequest {
  workoutPlanId: string;
  dayOfWeek: DayOfWeekDto;
  splitType: WorkoutSplitTypeDto;
  title: string;
  isRestDay: boolean;
  displayOrder: number;
  exercises: readonly CreateWorkoutDayExercise[];
}

export interface UpdateWorkoutPlanDayRequest {
  dayOfWeek: DayOfWeekDto;
  splitType: WorkoutSplitTypeDto;
  title: string;
  isRestDay: boolean;
  displayOrder: number;
  exercises: readonly CreateWorkoutDayExercise[];
}

export interface CreateWorkoutDayExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  targetWeightKg: number | null;
}
