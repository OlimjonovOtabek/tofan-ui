import {
  EquipmentType,
  ExerciseDifficulty,
  ExerciseGender,
  ExerciseType,
  MuscleGroup,
} from '../exercise-attributes';

/** Catalog entry a trainee's plan is built from. Names are kept in three languages. */
export class Exercise {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly nameUz: string,
    readonly nameRu: string,
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

  /** What the panel shows in lists: the Uzbek name when it exists. */
  get displayName(): string {
    return this.nameUz.length > 0 ? this.nameUz : this.name;
  }

  hasVideo(): boolean {
    return this.videoFileId !== null;
  }
}
