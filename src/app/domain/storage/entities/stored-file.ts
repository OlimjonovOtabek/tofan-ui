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

  /** The name as uploaded, which the panel shows since stored names are opaque ids. */
  get displayName(): string {
    return this.caption !== null && this.caption.length > 0 ? this.caption : this.originalName;
  }

  isVideo(): boolean {
    return this.contentType.startsWith('video/');
  }

  isImage(): boolean {
    return this.contentType.startsWith('image/');
  }
}
