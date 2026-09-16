import { ExerciseRepository } from '@domain/exercises/repositories/exercise.repository';
import { FileUsage } from '@domain/storage/file-usage';

/** The backend caps a page at 1000 rows. */
const BATCH_SIZE = 1000;

/**
 * Finds the records that still point at a file. Exercises are the only records with a file
 * reference today; the backend offers no lookup by file id, so the catalog is read in full.
 */
export class FindFileUsagesUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  async execute(fileId: string): Promise<readonly FileUsage[]> {
    const usages: FileUsage[] = [];
    for (let first = 0; ; first += BATCH_SIZE) {
      const page = await this.exerciseRepository.list({}, { first, rows: BATCH_SIZE });
      for (const exercise of page.items) {
        if (exercise.videoFileId === fileId) {
          usages.push({
            kind: 'exerciseVideo',
            ownerId: exercise.id,
            ownerName: exercise.displayName,
          });
        }
      }
      if (page.items.length === 0 || first + BATCH_SIZE >= page.totalCount) {
        return usages;
      }
    }
  }
}
