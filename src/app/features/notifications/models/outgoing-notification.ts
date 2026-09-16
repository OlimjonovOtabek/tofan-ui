import { ValidationError, ValidationIssue } from '@shared/models/errors/validation.error';
import { isUuid } from '@shared/utils/identifiers';
import {
  NOTIFICATION_BODY_MAX_LENGTH,
  NOTIFICATION_TITLE_MAX_LENGTH,
  NotificationType,
} from './notification-attributes';
import { textIssues } from './notification-template-draft';

export interface NotificationDataEntry {
  readonly key: string;
  readonly value: string;
}

export type NotificationData = Readonly<Record<string, string>>;

export interface CustomNotification {
  readonly userId: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string;
  readonly data: NotificationData | null;
}

export interface TemplatedNotification {
  readonly userId: string;
  readonly type: NotificationType;
  readonly data: NotificationData | null;
}

export interface CustomNotificationInput {
  readonly userId: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string;
  readonly data: readonly NotificationDataEntry[];
}

export interface TemplatedNotificationInput {
  readonly userId: string;
  readonly type: NotificationType;
  readonly data: readonly NotificationDataEntry[];
}

export function createCustomNotification(input: CustomNotificationInput): CustomNotification {
  const userId = input.userId.trim();
  const title = input.title.trim();
  const body = input.body.trim();
  const payload = toNotificationData(input.data);

  throwIfAny([
    ...userIdIssues(userId),
    ...textIssues('Title', title, NOTIFICATION_TITLE_MAX_LENGTH),
    ...textIssues('Body', body, NOTIFICATION_BODY_MAX_LENGTH),
    ...payload.issues,
  ]);
  return { userId, type: input.type, title, body, data: payload.data };
}

export function createTemplatedNotification(
  input: TemplatedNotificationInput,
): TemplatedNotification {
  const userId = input.userId.trim();
  const payload = toNotificationData(input.data);

  throwIfAny([...userIdIssues(userId), ...payload.issues]);
  return { userId, type: input.type, data: payload.data };
}

function userIdIssues(userId: string): ValidationIssue[] {
  if (userId.length === 0) {
    return [{ code: 'UserId.Empty', message: 'The recipient is required.' }];
  }
  return isUuid(userId)
    ? []
    : [{ code: 'UserId.Invalid', message: 'The recipient id must be a UUID.' }];
}

function toNotificationData(entries: readonly NotificationDataEntry[]): {
  data: NotificationData | null;
  issues: ValidationIssue[];
} {
  const filled = entries
    .map((entry) => ({ key: entry.key.trim(), value: entry.value.trim() }))
    .filter((entry) => entry.key.length > 0 || entry.value.length > 0);

  const issues: ValidationIssue[] = [];
  const data: Record<string, string> = {};
  for (const entry of filled) {
    if (entry.key.length === 0) {
      issues.push({ code: 'Data.KeyEmpty', message: 'Every payload value needs a key.' });
    } else if (Object.hasOwn(data, entry.key)) {
      issues.push({ code: 'Data.KeyDuplicate', message: `The key "${entry.key}" is repeated.` });
    } else {
      data[entry.key] = entry.value;
    }
  }

  return { data: Object.keys(data).length === 0 ? null : data, issues };
}

function throwIfAny(issues: readonly ValidationIssue[]): void {
  if (issues.length > 0) {
    throw new ValidationError('The notification cannot be sent as it is.', issues);
  }
}
