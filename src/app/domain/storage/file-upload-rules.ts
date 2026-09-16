import { BusinessRuleError } from '@domain/shared/errors/business-rule.error';
import { FileCategory } from './file-category';

const MEGABYTE = 1024 * 1024;

const VIDEO_EXTENSIONS = ['.mp4', '.m4v', '.mov', '.webm'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/** Mirrors `FileUploadRules` in the backend, so a doomed 200 MB upload is stopped before it starts. */
export function allowedExtensions(category: FileCategory): readonly string[] {
  switch (category) {
    case 'exerciseVideo':
      return VIDEO_EXTENSIONS;
    case 'document':
      return ['.pdf'];
    default:
      return IMAGE_EXTENSIONS;
  }
}

export function maxUploadSize(category: FileCategory): number {
  switch (category) {
    case 'exerciseVideo':
      return 200 * MEGABYTE;
    case 'document':
      return 20 * MEGABYTE;
    default:
      return 10 * MEGABYTE;
  }
}

/** @throws BusinessRuleError with the same code the backend would answer with. */
export function ensureUploadIsAllowed(name: string, size: number, category: FileCategory): void {
  if (size === 0) {
    throw new BusinessRuleError('The uploaded file is empty.', 'StoredFile.Empty');
  }
  if (!allowedExtensions(category).includes(extensionOf(name))) {
    throw new BusinessRuleError(
      'The file type is not accepted for this file category.',
      'StoredFile.UnsupportedContent',
    );
  }
  if (size > maxUploadSize(category)) {
    throw new BusinessRuleError(
      'The uploaded file exceeds the maximum size for its category.',
      'StoredFile.TooLarge',
    );
  }
}

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}
