import { Page, PageRequest } from '@domain/shared/paging/page';
import { FileCategory } from '../file-category';
import { StoredFile } from '../entities/stored-file';

/** `File` is a browser type, not a framework one: the panel only ever uploads what a user picked. */
export interface FileUploadRequest {
  readonly file: File;
  readonly category: FileCategory;
  readonly caption?: string;
  /** Called with 0..100 while the bytes travel. */
  readonly onProgress?: (percent: number) => void;
}

export abstract class FileRepository {
  /** Every stored file, whoever uploaded it; the backend has no owner or category filter. */
  abstract list(page: PageRequest): Promise<Page<StoredFile>>;

  /** @returns id of the stored file. */
  abstract upload(request: FileUploadRequest): Promise<string>;

  abstract getById(id: string): Promise<StoredFile>;

  abstract delete(id: string): Promise<void>;

  /** Public URL of the raw content; the endpoint is anonymous, so it works in `img`/`video` tags. */
  abstract contentUrl(id: string): string;
}
