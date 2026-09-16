import { FileCategory } from '../file-category';

export class StoredFile {
  constructor(
    readonly id: string,
    readonly category: FileCategory,
    readonly originalName: string,
    readonly contentType: string,
    readonly size: number,
    readonly createdAt: Date,
    readonly caption: string | null = null,
  ) {}

  isVideo(): boolean {
    return this.contentType.startsWith('video/');
  }

  isImage(): boolean {
    return this.contentType.startsWith('image/');
  }
}
