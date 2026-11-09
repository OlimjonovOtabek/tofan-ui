import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { acceptAttribute, ensureUploadIsAllowed, maxUploadSize } from './file-upload-rules';

const MEGABYTE = 1024 * 1024;

describe('ensureUploadIsAllowed', () => {
  it('should accept the video when it is within the exercise limit', () => {
    expect(() => ensureUploadIsAllowed('squat.MP4', 150 * MEGABYTE, 'exerciseVideo')).not.toThrow();
  });

  it('should reject the file when it is empty', () => {
    expect(() => ensureUploadIsAllowed('squat.mp4', 0, 'exerciseVideo')).toThrow(
      expect.objectContaining({ code: 'StoredFile.Empty' }),
    );
  });

  it('should reject the file when the category does not accept its type', () => {
    expect(() => ensureUploadIsAllowed('squat.avi', MEGABYTE, 'exerciseVideo')).toThrow(
      expect.objectContaining({ code: 'StoredFile.UnsupportedContent' }),
    );
    expect(() => ensureUploadIsAllowed('photo.png', MEGABYTE, 'exerciseVideo')).toThrow(
      BusinessRuleError,
    );
  });

  it('should reject the file when it is over the category limit', () => {
    expect(() => ensureUploadIsAllowed('squat.mp4', 201 * MEGABYTE, 'exerciseVideo')).toThrow(
      expect.objectContaining({ code: 'StoredFile.TooLarge' }),
    );
    expect(() => ensureUploadIsAllowed('food.jpg', 11 * MEGABYTE, 'foodImage')).toThrow(
      expect.objectContaining({ code: 'StoredFile.TooLarge' }),
    );
  });

  it('should expose the backend limits when asked per category', () => {
    expect(maxUploadSize('exerciseVideo')).toBe(200 * MEGABYTE);
    expect(maxUploadSize('document')).toBe(20 * MEGABYTE);
    expect(maxUploadSize('avatar')).toBe(10 * MEGABYTE);
  });
});

describe('chat upload rules', () => {
  it('should accept the chat file types when they are in the backend list', () => {
    expect(() => ensureUploadIsAllowed('plan.docx', MEGABYTE, 'chatFile')).not.toThrow();
    expect(() => ensureUploadIsAllowed('voice.webm', MEGABYTE, 'chatVoice')).not.toThrow();
    expect(() => ensureUploadIsAllowed('note.mov', MEGABYTE, 'chatVideoNote')).not.toThrow();
  });

  it('should reject a chat image when it is not a still image', () => {
    expect(() => ensureUploadIsAllowed('photo.heic', MEGABYTE, 'chatImage')).toThrow(
      expect.objectContaining({ code: 'StoredFile.UnsupportedContent' }),
    );
  });

  it('should expose the chat limits when asked per category', () => {
    expect(maxUploadSize('chatImage')).toBe(10 * MEGABYTE);
    expect(maxUploadSize('chatVoice')).toBe(20 * MEGABYTE);
    expect(maxUploadSize('chatVideoNote')).toBe(50 * MEGABYTE);
    expect(maxUploadSize('chatFile')).toBe(50 * MEGABYTE);
  });

  it('should list the extensions for the file input when asked for the accept attribute', () => {
    expect(acceptAttribute('chatImage')).toBe('.jpg,.jpeg,.png,.webp');
  });
});
