import {
  EquipmentType,
  ExerciseDifficulty,
  ExerciseGender,
  ExerciseType,
  MuscleGroup,
} from './exercise-attributes';
import { LocalizedText } from '@shared/models/localized-text';

export class Exercise {
  constructor(
    readonly id: string,
    readonly names: LocalizedText,
    readonly muscleGroup: MuscleGroup,
    readonly equipmentType: EquipmentType,
    readonly difficulty: ExerciseDifficulty,
    readonly type: ExerciseType,
    readonly gender: ExerciseGender,
    readonly isCompound: boolean,
    readonly isHomeExercise: boolean,
    readonly isActive: boolean,
    readonly instructions: string | null = null,
    readonly videoFileId: string | null = null,
  ) {}

  hasVideo(): boolean {
    return this.videoFileId !== null;
  }
}
