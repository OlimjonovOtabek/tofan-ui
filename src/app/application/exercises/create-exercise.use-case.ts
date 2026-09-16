import { ExerciseDraft, createExerciseDraft } from '@domain/exercises/exercise-draft';
import { ExerciseRepository } from '@domain/exercises/repositories/exercise.repository';

export class CreateExerciseUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  /** @throws ValidationError when a name is missing. */
  execute(draft: ExerciseDraft): Promise<string> {
    return this.exerciseRepository.create(createExerciseDraft(draft));
  }
}
