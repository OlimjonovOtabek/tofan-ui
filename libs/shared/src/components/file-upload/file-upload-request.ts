import { FileCategory } from '@shared/models/file-category';

export interface FileUploadRequest {
  readonly file: File;
  readonly category: FileCategory;
  readonly caption?: string;
  readonly onProgress?: (percent: number) => void;
}

export interface FileUploadTask {
  readonly result: Promise<string>;
  cancel(): void;
}

export class UploadCancelledError extends Error {
  constructor() {
    super('Upload cancelled');
  }
}

export function isUploadCancelled(error: unknown): error is UploadCancelledError {
  return error instanceof UploadCancelledError;
}
