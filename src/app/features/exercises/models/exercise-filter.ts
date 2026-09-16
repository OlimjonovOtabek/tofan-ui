import { EquipmentType, ExerciseGender, MuscleGroup } from './exercise-attributes';

export interface ExerciseFilter {
  readonly search?: string;
  readonly muscleGroup?: MuscleGroup;
  readonly equipmentType?: EquipmentType;
  readonly gender?: ExerciseGender;
  readonly isHomeExercise?: boolean;
  readonly isActive?: boolean;
}
