import { enumMap } from '@shared/utils/enum-map';
import { FileCategory } from './file-category';

export enum FileCategoryDto {
  ExerciseVideo = 1,
  ExerciseThumbnail = 2,
  Avatar = 3,
  FoodImage = 4,
  ProductImage = 5,
  Document = 6,
  GarmentImage = 7,
  ChatImage = 8,
  ChatVoice = 9,
  ChatVideoNote = 10,
  ChatFile = 11,
}

export const fileCategories = enumMap<FileCategory, FileCategoryDto>(FileCategoryDto);
