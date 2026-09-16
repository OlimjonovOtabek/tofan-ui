import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ensureUploadIsAllowed, maxUploadSize } from './file-upload-rules';

const MEGABYTE = 1024 * 1024;

describe('ensureUploadIsAllowed', () => {
  it('accepts a video within the exercise limit', () => {
    expect(() => ensureUploadIsAllowed('squat.MP4', 150 * MEGABYTE, 'exerciseVideo')).not.toThrow();
  });

  it('rejects an empty file', () => {
    expect(() => ensureUploadIsAllowed('squat.mp4', 0, 'exerciseVideo')).toThrow(
      expect.objectContaining({ code: 'StoredFile.Empty' }),
    );
  });

  it('rejects a type the category does not accept', () => {
    expect(() => ensureUploadIsAllowed('squat.avi', MEGABYTE, 'exerciseVideo')).toThrow(
      expect.objectContaining({ code: 'StoredFile.UnsupportedContent' }),
    );
    expect(() => ensureUploadIsAllowed('photo.png', MEGABYTE, 'exerciseVideo')).toThrow(
      BusinessRuleError,
    );
  });

  it('rejects a file that is over the limit of its category', () => {
    expect(() => ensureUploadIsAllowed('squat.mp4', 201 * MEGABYTE, 'exerciseVideo')).toThrow(
      expect.objectContaining({ code: 'StoredFile.TooLarge' }),
    );
    expect(() => ensureUploadIsAllowed('food.jpg', 11 * MEGABYTE, 'foodImage')).toThrow(
      expect.objectContaining({ code: 'StoredFile.TooLarge' }),
    );
  });

  it('keeps the same limits as the backend', () => {
    expect(maxUploadSize('exerciseVideo')).toBe(200 * MEGABYTE);
    expect(maxUploadSize('document')).toBe(20 * MEGABYTE);
    expect(maxUploadSize('avatar')).toBe(10 * MEGABYTE);
  });
});
