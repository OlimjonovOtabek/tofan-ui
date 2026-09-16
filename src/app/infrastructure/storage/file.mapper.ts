import { StoredFile } from '@domain/storage/entities/stored-file';
import { FileCategory } from '@domain/storage/file-category';
import { enumMap } from '@infrastructure/api/enum-map';
import { FileCategory as ApiFileCategory, StoredFileResponse } from '@infrastructure/api/generated';

export const fileCategories = enumMap<FileCategory, ApiFileCategory>(ApiFileCategory);

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
