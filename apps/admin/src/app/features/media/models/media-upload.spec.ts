import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { CAPTION_MAX_LENGTH, createMediaUpload } from './media-upload';

const video = new File(['video'], 'squat.mp4', { type: 'video/mp4' });
const EXERCISE_ID = '7b1c5a2e-0000-4000-8000-000000000001';

describe('createMediaUpload', () => {
  it('should keep the exercise and trim the caption when an exercise video is complete', () => {
    expect(
      createMediaUpload({
        file: video,
        category: 'exerciseVideo',
        exerciseId: EXERCISE_ID,
        caption: '  Skvat  ',
      }),
    ).toEqual({
      file: video,
      category: 'exerciseVideo',
      exerciseId: EXERCISE_ID,
      caption: 'Skvat',
    });
  });

  it('should reject an exercise video when no exercise was chosen', () => {
    expect(() =>
      createMediaUpload({ file: video, category: 'exerciseVideo', exerciseId: null, caption: '' }),
    ).toThrow(BusinessRuleError);
  });

  it('should drop the exercise and a blank caption when the file is not an exercise video', () => {
    expect(
      createMediaUpload({
        file: video,
        category: 'document',
        exerciseId: EXERCISE_ID,
        caption: ' ',
      }),
    ).toEqual({ file: video, category: 'document' });
  });

  it('should reject the draft when the file or the category is missing', () => {
    expect(() =>
      createMediaUpload({ file: null, category: 'avatar', exerciseId: null, caption: '' }),
    ).toThrow(BusinessRuleError);
    expect(() =>
      createMediaUpload({ file: video, category: null, exerciseId: null, caption: '' }),
    ).toThrow(BusinessRuleError);
  });

  it('should reject the draft when the caption is longer than the backend allows', () => {
    const caption = 'a'.repeat(CAPTION_MAX_LENGTH + 1);

    expect(() =>
      createMediaUpload({ file: video, category: 'avatar', exerciseId: null, caption }),
    ).toThrow(BusinessRuleError);
  });
});
