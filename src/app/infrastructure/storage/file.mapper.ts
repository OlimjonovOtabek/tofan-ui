import { StoredFile } from '@domain/storage/entities/stored-file';
import { FileCategory } from '@domain/storage/file-category';
import { FileCategory as ApiFileCategory, StoredFileResponse } from '@infrastructure/api/generated';

const CATEGORIES: Record<FileCategory, ApiFileCategory> = {
  exerciseVideo: ApiFileCategory.ExerciseVideo,
  exerciseThumbnail: ApiFileCategory.ExerciseThumbnail,
  avatar: ApiFileCategory.Avatar,
  foodImage: ApiFileCategory.FoodImage,
  productImage: ApiFileCategory.ProductImage,
  document: ApiFileCategory.Document,
};

export function toApiFileCategory(category: FileCategory): ApiFileCategory {
  return CATEGORIES[category];
}

export function toFileCategory(category: ApiFileCategory): FileCategory {
  const match = Object.entries(CATEGORIES).find(([, value]) => value === category);
  return (match?.[0] as FileCategory | undefined) ?? 'document';
}

export function toStoredFile(response: StoredFileResponse): StoredFile {
  return new StoredFile(
    response.id,
    toFileCategory(response.category),
    response.originalName,
    response.contentType,
    response.size,
    new Date(response.createdOnUtc),
    response.caption ?? null,
  );
}
