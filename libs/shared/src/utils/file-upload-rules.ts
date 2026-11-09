import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { FileCategory } from '@shared/models/file-category';

const MEGABYTE = 1024 * 1024;

const VIDEO_EXTENSIONS = ['.mp4', '.m4v', '.mov', '.webm'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const VOICE_EXTENSIONS = ['.m4a', '.mp4', '.aac', '.ogg', '.opus', '.webm', '.mp3'];
const VIDEO_NOTE_EXTENSIONS = ['.mp4', '.mov', '.webm'];
const CHAT_FILE_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.csv',
  '.zip',
  '.rar',
  ...IMAGE_EXTENSIONS,
  '.mp4',
  '.mov',
];

interface CategoryRule {
  readonly extensions: readonly string[];
  readonly maxSize: number;
}

const IMAGE_RULE: CategoryRule = { extensions: IMAGE_EXTENSIONS, maxSize: 10 * MEGABYTE };

const RULES: Record<FileCategory, CategoryRule> = {
  exerciseVideo: { extensions: VIDEO_EXTENSIONS, maxSize: 200 * MEGABYTE },
  exerciseThumbnail: IMAGE_RULE,
  avatar: IMAGE_RULE,
  foodImage: IMAGE_RULE,
  productImage: IMAGE_RULE,
  document: { extensions: ['.pdf'], maxSize: 20 * MEGABYTE },
  garmentImage: IMAGE_RULE,
  chatImage: IMAGE_RULE,
  chatVoice: { extensions: VOICE_EXTENSIONS, maxSize: 20 * MEGABYTE },
  chatVideoNote: { extensions: VIDEO_NOTE_EXTENSIONS, maxSize: 50 * MEGABYTE },
  chatFile: { extensions: CHAT_FILE_EXTENSIONS, maxSize: 50 * MEGABYTE },
};

export function allowedExtensions(category: FileCategory): readonly string[] {
  return RULES[category].extensions;
}

export function maxUploadSize(category: FileCategory): number {
  return RULES[category].maxSize;
}

export function acceptAttribute(category: FileCategory): string {
  return allowedExtensions(category).join(',');
}

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
