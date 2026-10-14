import { FileCategoryDto } from '@shared/models/file-category.dto';

export interface StoredFileResponse {
  id: string;
  category: FileCategoryDto;
  originalName: string;
  contentType: string;
  extension: string;
  size: number;
  createdOnUtc: string;
  caption?: string | null;
}
