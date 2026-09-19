import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { FileCategory } from '@shared/models/file-category';

export const CAPTION_MAX_LENGTH = 500;

export interface MediaUploadDraft {
  readonly file: File | null;
  readonly category: FileCategory | null;
  readonly caption: string;
}

export interface MediaUpload {
  readonly file: File;
  readonly category: FileCategory;
  readonly caption?: string;
}

export function createMediaUpload(draft: MediaUploadDraft): MediaUpload {
  if (draft.file === null) {
    throw new BusinessRuleError('Yuklash uchun fayl tanlang.', 'MediaUpload.FileMissing');
  }
  if (draft.category === null) {
    throw new BusinessRuleError('Fayl turini tanlang.', 'MediaUpload.CategoryMissing');
  }
  const caption = draft.caption.trim();
  if (caption.length > CAPTION_MAX_LENGTH) {
    throw new BusinessRuleError(
      `Izoh ${CAPTION_MAX_LENGTH} belgidan oshmasligi kerak.`,
      'MediaUpload.CaptionTooLong',
    );
  }
  return {
    file: draft.file,
    category: draft.category,
    ...(caption.length === 0 ? {} : { caption }),
  };
}
