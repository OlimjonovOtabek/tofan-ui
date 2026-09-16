import { ValidationError } from '@shared/models/errors/validation.error';
import {
  NotificationTemplateDraft,
  createNotificationTemplateDraft,
} from './notification-template-draft';

const draft: NotificationTemplateDraft = {
  type: 'waterReminder',
  trainerStyle: 'soft',
  title: 'A glass of water?',
  titleUz: 'Bir stakan suv?',
  titleRu: 'Стакан воды?',
  body: 'Drink some water.',
  bodyUz: 'Ozgina suv iching.',
  bodyRu: 'Выпейте воды.',
  isActive: true,
};

describe('createNotificationTemplateDraft', () => {
  it('should trim every text when it has surrounding spaces', () => {
    expect(createNotificationTemplateDraft({ ...draft, titleUz: '  Suv  ' }).titleUz).toBe('Suv');
  });

  it('should reject the draft when any language is missing', () => {
    let error: unknown;
    try {
      createNotificationTemplateDraft({
        ...draft,
        titleRu: '',
        body: ' ',
        bodyUz: 'x'.repeat(2049),
      });
    } catch (thrown) {
      error = thrown;
    }

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues.map((issue) => issue.code)).toEqual([
      'TitleRu.Empty',
      'Body.Empty',
      'BodyUz.TooLong',
    ]);
  });
});
