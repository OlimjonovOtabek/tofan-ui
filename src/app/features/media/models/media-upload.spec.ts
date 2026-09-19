import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { CAPTION_MAX_LENGTH, createMediaUpload } from './media-upload';

const file = new File(['video'], 'squat.mp4', { type: 'video/mp4' });

describe('createMediaUpload', () => {
  it('should trim the caption when the draft is complete', () => {
    expect(createMediaUpload({ file, category: 'exerciseVideo', caption: '  Skvat  ' })).toEqual({
      file,
      category: 'exerciseVideo',
      caption: 'Skvat',
    });
  });

  it('should leave the caption out when it is blank', () => {
    expect(createMediaUpload({ file, category: 'document', caption: '   ' })).toEqual({
      file,
      category: 'document',
    });
  });

  it('should reject the draft when the file or the category is missing', () => {
    expect(() => createMediaUpload({ file: null, category: 'avatar', caption: '' })).toThrow(
      BusinessRuleError,
    );
    expect(() => createMediaUpload({ file, category: null, caption: '' })).toThrow(
      BusinessRuleError,
    );
  });

  it('should reject the draft when the caption is longer than the backend allows', () => {
    const caption = 'a'.repeat(CAPTION_MAX_LENGTH + 1);

    expect(() => createMediaUpload({ file, category: 'avatar', caption })).toThrow(
      BusinessRuleError,
    );
  });
});
