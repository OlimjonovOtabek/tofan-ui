import { fileCategories } from '@shared/models/file-category.dto';
import { StoredFile } from '../models/stored-file';
import { StoredFileResponse } from './stored-file.dto';

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
