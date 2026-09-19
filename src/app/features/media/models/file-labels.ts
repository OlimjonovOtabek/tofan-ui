import { FILE_CATEGORIES, FileCategory } from '@shared/models/file-category';
import { toSelectOptions } from '@shared/models/select-option';

export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  exerciseVideo: 'Mashq videosi',
  exerciseThumbnail: 'Mashq rasmi',
  avatar: 'Avatar',
  foodImage: 'Ovqat rasmi',
  productImage: 'Mahsulot rasmi',
  document: 'Hujjat',
};

export const FILE_CATEGORY_OPTIONS = toSelectOptions(FILE_CATEGORIES, FILE_CATEGORY_LABELS);
