import { ExerciseRepository } from '@domain/exercises/repositories/exercise.repository';

export class DeleteExerciseUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  execute(id: string): Promise<void> {
    return this.exerciseRepository.delete(id);
  }
}
