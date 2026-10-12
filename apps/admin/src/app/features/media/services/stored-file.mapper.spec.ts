import { FILE_CATEGORIES } from '@shared/models/file-category';
import { FileCategoryDto as FileCategory, fileCategories } from '@shared/models/file-category.dto';
import { toStoredFile } from './stored-file.mapper';

describe('file mapper', () => {
  it('should map every category when converting both ways', () => {
    for (const category of FILE_CATEGORIES) {
      expect(fileCategories.toDomain(fileCategories.toApi(category))).toBe(category);
    }
  });

  it('should show the caption when the stored file has one', () => {
    const file = toStoredFile({
      id: '1',
      category: FileCategory.ExerciseVideo,
      originalName: 'squat.mp4',
      extension: '.mp4',
      contentType: 'video/mp4',
      size: 1024,
      caption: 'Skvat texnikasi',
      createdOnUtc: '2026-09-10T08:30:00Z',
    });

    expect(file.category).toBe('exerciseVideo');
    expect(file.isVideo()).toBe(true);
    expect(file.displayName).toBe('Skvat texnikasi');
    expect(file.createdAt.toISOString()).toBe('2026-09-10T08:30:00.000Z');
  });

  it('should show the uploaded name when there is no caption', () => {
    const file = toStoredFile({
      id: '2',
      category: FileCategory.Document,
      originalName: 'guide.pdf',
      extension: '.pdf',
      contentType: 'application/pdf',
      size: 10,
      caption: null,
      createdOnUtc: '2026-09-10T08:30:00Z',
    });

    expect(file.displayName).toBe('guide.pdf');
  });
});
