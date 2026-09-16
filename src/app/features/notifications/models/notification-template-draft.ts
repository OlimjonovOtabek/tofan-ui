import { ValidationError, ValidationIssue } from '@shared/models/errors/validation.error';
import {
  NOTIFICATION_BODY_MAX_LENGTH,
  NOTIFICATION_TITLE_MAX_LENGTH,
  NotificationType,
  TrainerStyle,
} from './notification-attributes';

export interface NotificationTemplateDraft {
  readonly type: NotificationType;
  readonly trainerStyle: TrainerStyle;
  readonly title: string;
  readonly titleUz: string;
  readonly titleRu: string;
  readonly body: string;
  readonly bodyUz: string;
  readonly bodyRu: string;
  readonly isActive: boolean;
}

export function createNotificationTemplateDraft(
  draft: NotificationTemplateDraft,
): NotificationTemplateDraft {
  const trimmed = trimTexts(draft);
  const issues = [
    ...textIssues('Title', trimmed.title, NOTIFICATION_TITLE_MAX_LENGTH),
    ...textIssues('TitleUz', trimmed.titleUz, NOTIFICATION_TITLE_MAX_LENGTH),
    ...textIssues('TitleRu', trimmed.titleRu, NOTIFICATION_TITLE_MAX_LENGTH),
    ...textIssues('Body', trimmed.body, NOTIFICATION_BODY_MAX_LENGTH),
    ...textIssues('BodyUz', trimmed.bodyUz, NOTIFICATION_BODY_MAX_LENGTH),
    ...textIssues('BodyRu', trimmed.bodyRu, NOTIFICATION_BODY_MAX_LENGTH),
  ];
  if (issues.length > 0) {
    throw new ValidationError('The template cannot be saved as it is.', issues);
  }
  return trimmed;
}

function trimTexts(draft: NotificationTemplateDraft): NotificationTemplateDraft {
  return {
    ...draft,
    title: draft.title.trim(),
    titleUz: draft.titleUz.trim(),
    titleRu: draft.titleRu.trim(),
    body: draft.body.trim(),
    bodyUz: draft.bodyUz.trim(),
    bodyRu: draft.bodyRu.trim(),
  };
}

export function textIssues(field: string, value: string, maxLength: number): ValidationIssue[] {
  if (value.length === 0) {
    return [{ code: `${field}.Empty`, message: `${field} is required.` }];
  }
  if (value.length > maxLength) {
    return [
      {
        code: `${field}.TooLong`,
        message: `${field} must be at most ${maxLength} characters.`,
      },
    ];
  }
  return [];
}
