import { FileCategory } from '@domain/storage/file-category';

/** Uzbek wording for the file categories; the domain keeps the values language-free. */
export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  exerciseVideo: 'Mashq videosi',
  exerciseThumbnail: 'Mashq rasmi',
  avatar: 'Avatar',
  foodImage: 'Ovqat rasmi',
  productImage: 'Mahsulot rasmi',
  document: 'Hujjat',
};
