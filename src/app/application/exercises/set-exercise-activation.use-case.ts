import { ExerciseRepository } from '@domain/exercises/repositories/exercise.repository';

/** An inactive exercise stays in the catalog but is no longer offered to trainees. */
export class SetExerciseActivationUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  execute(id: string, isActive: boolean): Promise<void> {
    return this.exerciseRepository.setActive(id, isActive);
  }
}
