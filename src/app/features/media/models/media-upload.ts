import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { FileCategory } from '@shared/models/file-category';
import { TranslationKey } from '@core/i18n/dictionary';

export const CAPTION_MAX_LENGTH = 500;

const FILE_MISSING: TranslationKey = 'media.upload.fileMissing';
const CATEGORY_MISSING: TranslationKey = 'media.upload.categoryMissing';
const CAPTION_TOO_LONG: TranslationKey = 'media.upload.captionTooLong';
const EXERCISE_MISSING: TranslationKey = 'media.upload.exerciseMissing';

export interface MediaUploadDraft {
  readonly file: File | null;
  readonly category: FileCategory | null;
  readonly exerciseId: string | null;
  readonly caption: string;
}

export interface MediaUpload {
  readonly file: File;
  readonly category: FileCategory;
  readonly exerciseId?: string;
  readonly caption?: string;
}

export function needsExercise(category: FileCategory | null): boolean {
  return category === 'exerciseVideo';
}

export function createMediaUpload(draft: MediaUploadDraft): MediaUpload {
  if (draft.file === null) {
    throw new BusinessRuleError(FILE_MISSING, 'MediaUpload.FileMissing');
  }
  if (draft.category === null) {
    throw new BusinessRuleError(CATEGORY_MISSING, 'MediaUpload.CategoryMissing');
  }
  const caption = draft.caption.trim();
  if (caption.length > CAPTION_MAX_LENGTH) {
    throw new BusinessRuleError(CAPTION_TOO_LONG, 'MediaUpload.CaptionTooLong');
  }
  return {
    file: draft.file,
    category: draft.category,
    ...exerciseOf(draft.category, draft.exerciseId),
    ...(caption.length === 0 ? {} : { caption }),
  };
}

function exerciseOf(category: FileCategory, exerciseId: string | null): { exerciseId?: string } {
  if (!needsExercise(category)) {
    return {};
  }
  if (exerciseId === null) {
    throw new BusinessRuleError(EXERCISE_MISSING, 'MediaUpload.ExerciseMissing');
  }
  return { exerciseId };
}
