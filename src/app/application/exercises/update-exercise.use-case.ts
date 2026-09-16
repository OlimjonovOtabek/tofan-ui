import { ExerciseDraft, createExerciseDraft } from '@domain/exercises/exercise-draft';
import { ExerciseRepository } from '@domain/exercises/repositories/exercise.repository';

export class UpdateExerciseUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  /** @throws ValidationError when a name is missing. */
  execute(id: string, draft: ExerciseDraft): Promise<void> {
    return this.exerciseRepository.update(id, createExerciseDraft(draft));
  }
}
