import { fileCategories } from '@shared/models/file-category.dto';
import { FileUsage } from '../models/file-usage';
import { StoredFile } from '../models/stored-file';
import { ExerciseVideoResponse, StoredFileResponse } from './stored-file.dto';

export function toStoredFile(response: StoredFileResponse): StoredFile {
  return new StoredFile(
    response.id,
    fileCategories.toDomain(response.category),
    response.originalName,
    response.contentType,
    response.size,
    new Date(response.createdOnUtc),
    response.caption ?? null,
  );
}

export function toExerciseVideoUsage(exercise: ExerciseVideoResponse): FileUsage {
  return {
    kind: 'exerciseVideo',
    ownerId: exercise.id,
    ownerName: exercise.nameUz.length > 0 ? exercise.nameUz : exercise.name,
  };
}
