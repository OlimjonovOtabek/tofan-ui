import { Page, PageRequest } from '@domain/shared/paging/page';
import { Exercise } from '../entities/exercise';
import { ExerciseDraft } from '../exercise-draft';
import { EquipmentType, ExerciseGender, MuscleGroup } from '../exercise-attributes';

/** Narrowing options the catalog list accepts; every field is optional. */
export interface ExerciseFilter {
  readonly search?: string;
  readonly muscleGroup?: MuscleGroup;
  readonly equipmentType?: EquipmentType;
  readonly gender?: ExerciseGender;
  readonly isHomeExercise?: boolean;
  readonly isActive?: boolean;
}

export abstract class ExerciseRepository {
  abstract list(filter: ExerciseFilter, page: PageRequest): Promise<Page<Exercise>>;

  abstract getById(id: string): Promise<Exercise>;

  /** @returns id of the created exercise. */
  abstract create(draft: ExerciseDraft): Promise<string>;

  abstract update(id: string, draft: ExerciseDraft): Promise<void>;

  abstract delete(id: string): Promise<void>;

  abstract setActive(id: string, isActive: boolean): Promise<void>;
}
