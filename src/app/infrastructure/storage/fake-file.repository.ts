import { Injectable } from '@angular/core';
import { StoredFile } from '@domain/storage/entities/stored-file';
import { FileRepository, FileUploadRequest } from '@domain/storage/repositories/file.repository';

const PROGRESS_STEP_MS = 120;
const PROGRESS_STEPS = [15, 40, 70, 100];

/** Mock adapter: pretends to upload, so the forms can be used without a backend. */
@Injectable()
export class FakeFileRepository implements FileRepository {
  private readonly files = new Map<string, StoredFile>();

  async upload({ file, category, onProgress }: FileUploadRequest): Promise<string> {
    for (const percent of PROGRESS_STEPS) {
      await delay(PROGRESS_STEP_MS);
      onProgress?.(percent);
    }

    const id = crypto.randomUUID();
    this.files.set(
      id,
      new StoredFile(id, category, file.name, file.type, file.size, new Date()),
    );
    return id;
  }

  async getById(id: string): Promise<StoredFile> {
    await delay(PROGRESS_STEP_MS);
    return (
      this.files.get(id) ??
      new StoredFile(id, 'document', 'namuna.pdf', 'application/pdf', 1024, new Date())
    );
  }

  async delete(id: string): Promise<void> {
    await delay(PROGRESS_STEP_MS);
    this.files.delete(id);
  }

  contentUrl(id: string): string {
    return `#${id}`;
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
