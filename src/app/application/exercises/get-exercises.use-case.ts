import { Page, PageRequest } from '@domain/shared/paging/page';
import { Exercise } from '@domain/exercises/entities/exercise';
import { ExerciseFilter, ExerciseRepository } from '@domain/exercises/repositories/exercise.repository';

export class GetExercisesUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  execute(filter: ExerciseFilter, page: PageRequest): Promise<Page<Exercise>> {
    return this.exerciseRepository.list(filter, page);
  }
}
