import { FILE_CATEGORIES } from '@shared/models/file-category';
import { FileCategoryDto as FileCategory, fileCategories } from '@shared/models/file-category.dto';
import { toExerciseVideoUsage, toStoredFile } from './stored-file.mapper';

describe('file mapper', () => {
  it('maps every category', () => {
    for (const category of FILE_CATEGORIES) {
      expect(fileCategories.toDomain(fileCategories.toApi(category))).toBe(category);
    }
  });

  it('maps a stored file, preferring the caption as the display name', () => {
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

  it('falls back to the uploaded name without a caption', () => {
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

  it('should name the exercise in Uzbek when it uses the file as its video', () => {
    expect(
      toExerciseVideoUsage({ id: '7', name: 'Squat', nameUz: 'Skvat', videoFileId: 'v' }),
    ).toEqual({ kind: 'exerciseVideo', ownerId: '7', ownerName: 'Skvat' });
  });
});
