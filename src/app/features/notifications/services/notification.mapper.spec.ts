import { NOTIFICATION_TYPES, TRAINER_STYLES } from '../models/notification-attributes';
import { NotificationType, TrainerStyle } from './notification.dto';
import {
  notificationTypes,
  toNotificationTemplate,
  toSendCustomRequest,
  toSendTemplatedRequest,
  trainerStyles,
} from './notification.mapper';

const USER_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('notification enum maps', () => {
  it('should map every value when converting enums both ways', () => {
    for (const value of NOTIFICATION_TYPES) {
      expect(notificationTypes.toDomain(notificationTypes.toApi(value))).toBe(value);
    }
    for (const value of TRAINER_STYLES) {
      expect(trainerStyles.toDomain(trainerStyles.toApi(value))).toBe(value);
    }
  });
});

describe('notification mapper', () => {
  it('should build the template with dates when a response arrives', () => {
    const template = toNotificationTemplate({
      id: '1',
      type: NotificationType.DpEarned,
      trainerStyle: TrainerStyle.Aggressive,
      title: 'DP',
      titleUz: 'DP olindi',
      titleRu: 'DP',
      body: 'b',
      bodyUz: 'b',
      bodyRu: 'b',
      isActive: true,
      createdOnUtc: '2026-09-01T09:00:00Z',
      updatedOnUtc: '2026-09-02T09:00:00Z',
    });

    expect(template.type).toBe('dpEarned');
    expect(template.trainerStyle).toBe('aggressive');
    expect(template.displayTitle).toBe('DP olindi');
    expect(template.updatedAt.toISOString()).toBe('2026-09-02T09:00:00.000Z');
  });

  it('should leave the payload out when there is none', () => {
    expect(toSendTemplatedRequest({ userId: USER_ID, type: 'weeklyReport', data: null })).toEqual({
      userId: USER_ID,
      type: NotificationType.WeeklyReport,
    });
  });

  it('should send the payload as a plain map when there is one', () => {
    const request = toSendCustomRequest({
      userId: USER_ID,
      type: 'workoutReminder',
      title: 't',
      body: 'b',
      data: { screen: 'exercises' },
    });

    expect(request.type).toBe(NotificationType.WorkoutReminder);
    expect(request.data).toEqual({ screen: 'exercises' });
  });
});
