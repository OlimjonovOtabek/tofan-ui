import { FileCategory } from '@shared/models/file-category';

export interface FileUploadRequest {
  readonly file: File;
  readonly category: FileCategory;
  readonly caption?: string;
  readonly onProgress?: (percent: number) => void;
}
