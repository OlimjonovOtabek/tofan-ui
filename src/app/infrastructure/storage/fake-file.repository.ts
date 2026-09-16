import { Injectable } from '@angular/core';
import { NotFoundError } from '@domain/shared/errors/not-found.error';
import { Page, PageRequest } from '@domain/shared/paging/page';
import { StoredFile } from '@domain/storage/entities/stored-file';
import { FileRepository, FileUploadRequest } from '@domain/storage/repositories/file.repository';
import { FAKE_SQUAT_VIDEO_ID } from '@infrastructure/exercises/fake-exercise.repository';

const PROGRESS_STEP_MS = 120;
const PROGRESS_STEPS = [15, 40, 70, 100];
const MEGABYTE = 1024 * 1024;

/**
 * A single green pixel, so image previews show something without a backend. PNG rather than SVG:
 * Angular's URL sanitizer lets `data:image/png` into `img` tags but blocks `data:image/svg+xml`.
 */
const PLACEHOLDER_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

function seed(): StoredFile[] {
  return [
    new StoredFile(
      FAKE_SQUAT_VIDEO_ID,
      'exerciseVideo',
      'barbell-squat.mp4',
      'video/mp4',
      48 * MEGABYTE,
      new Date('2026-09-10T08:30:00Z'),
    ),
    new StoredFile(
      '55555555-5555-5555-5555-555555555555',
      'exerciseVideo',
      'push-up-old.mp4',
      'video/mp4',
      31 * MEGABYTE,
      new Date('2026-09-02T12:00:00Z'),
    ),
    new StoredFile(
      '66666666-6666-6666-6666-666666666666',
      'foodImage',
      'plov.jpg',
      'image/jpeg',
      Math.round(1.4 * MEGABYTE),
      new Date('2026-09-12T15:45:00Z'),
    ),
    new StoredFile(
      '77777777-7777-7777-7777-777777777777',
      'document',
      'ovqatlanish-qollanma.pdf',
      'application/pdf',
      Math.round(2.2 * MEGABYTE),
      new Date('2026-08-28T10:10:00Z'),
    ),
  ];
}

/** Mock adapter: pretends to store files, so the forms and the media page work without a backend. */
@Injectable()
export class FakeFileRepository implements FileRepository {
  private files = seed();

  async list(page: PageRequest): Promise<Page<StoredFile>> {
    await delay(PROGRESS_STEP_MS);
    const sorted = [...this.files].sort(compareBy(page));
    return {
      items: sorted.slice(page.first, page.first + page.rows),
      totalCount: sorted.length,
    };
  }

  async upload({ file, category, onProgress }: FileUploadRequest): Promise<string> {
    for (const percent of PROGRESS_STEPS) {
      await delay(PROGRESS_STEP_MS);
      onProgress?.(percent);
    }

    const id = crypto.randomUUID();
    this.files = [
      new StoredFile(id, category, file.name, file.type, file.size, new Date()),
      ...this.files,
    ];
    return id;
  }

  async getById(id: string): Promise<StoredFile> {
    await delay(PROGRESS_STEP_MS);
    return this.find(id);
  }

  async delete(id: string): Promise<void> {
    await delay(PROGRESS_STEP_MS);
    this.find(id);
    this.files = this.files.filter((file) => file.id !== id);
  }

  /** Images get a placeholder; there are no mock bytes for anything else. */
  contentUrl(id: string): string {
    return this.files.find((file) => file.id === id)?.isImage() === true ? PLACEHOLDER_IMAGE : '';
  }

  private find(id: string): StoredFile {
    const file = this.files.find((candidate) => candidate.id === id);
    if (file === undefined) {
      throw new NotFoundError('The stored file was not found.', 'StoredFile.NotFound');
    }
    return file;
  }
}

/** Mirrors the backend defaults: sorted by id unless a column was chosen. */
function compareBy(page: PageRequest): (a: StoredFile, b: StoredFile) => number {
  const direction = page.sortDirection === 'desc' ? -1 : 1;
  const key = (file: StoredFile): string | number => {
    switch (page.sortField) {
      case 'createdOnUtc':
        return file.createdAt.getTime();
      case 'size':
        return file.size;
      case 'originalName':
        return file.originalName.toLowerCase();
      default:
        return file.id;
    }
  };
  return (a, b) => (key(a) < key(b) ? -direction : key(a) > key(b) ? direction : 0);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
