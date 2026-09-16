import { ValidationError } from '@shared/models/errors/validation.error';
import {
  CustomNotificationInput,
  createCustomNotification,
  createTemplatedNotification,
} from './outgoing-notification';

const USER_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

const custom: CustomNotificationInput = {
  userId: USER_ID,
  type: 'workoutReminder',
  title: 'Mashg‘ulot vaqti',
  body: 'Bugungi mashg‘ulotingiz sizni kutmoqda.',
  data: [],
};

function issueCodesOf(run: () => unknown): string[] {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return (error as ValidationError).issues.map((issue) => issue.code);
  }
  throw new Error('Expected the notification to be rejected.');
}

describe('createCustomNotification', () => {
  it('should trim the text and send no payload when there is none', () => {
    const notification = createCustomNotification({
      ...custom,
      userId: ` ${USER_ID} `,
      title: '  Salom ',
    });

    expect(notification.userId).toBe(USER_ID);
    expect(notification.title).toBe('Salom');
    expect(notification.data).toBeNull();
  });

  it('should reject the notification when the recipient is not a UUID', () => {
    expect(issueCodesOf(() => createCustomNotification({ ...custom, userId: '' }))).toEqual([
      'UserId.Empty',
    ]);
    expect(issueCodesOf(() => createCustomNotification({ ...custom, userId: '42' }))).toEqual([
      'UserId.Invalid',
    ]);
  });

  it('should reject the notification when the text is empty or too long', () => {
    expect(
      issueCodesOf(() =>
        createCustomNotification({ ...custom, title: ' ', body: 'x'.repeat(2049) }),
      ),
    ).toEqual(['Title.Empty', 'Body.TooLong']);
    expect(() =>
      createCustomNotification({ ...custom, title: 'x'.repeat(256), body: 'x'.repeat(2048) }),
    ).not.toThrow();
  });

  it('should build the payload map when some rows are blank', () => {
    const notification = createCustomNotification({
      ...custom,
      data: [
        { key: ' screen ', value: ' exercises ' },
        { key: '', value: '' },
        { key: 'exerciseCount', value: '20' },
      ],
    });

    expect(notification.data).toEqual({ screen: 'exercises', exerciseCount: '20' });
  });

  it('should reject the payload when a key is missing or repeated', () => {
    expect(
      issueCodesOf(() =>
        createCustomNotification({
          ...custom,
          data: [
            { key: 'screen', value: 'a' },
            { key: 'screen', value: 'b' },
            { key: '', value: 'orphan' },
          ],
        }),
      ),
    ).toEqual(['Data.KeyDuplicate', 'Data.KeyEmpty']);
  });
});

describe('createTemplatedNotification', () => {
  it('should accept the notification when it has a valid recipient and a type', () => {
    expect(
      createTemplatedNotification({ userId: USER_ID, type: 'weeklyReport', data: [] }),
    ).toEqual({ userId: USER_ID, type: 'weeklyReport', data: null });
  });

  it('should reject the notification when the recipient or payload is invalid', () => {
    expect(
      issueCodesOf(() =>
        createTemplatedNotification({
          userId: 'nope',
          type: 'weeklyReport',
          data: [{ key: '', value: 'x' }],
        }),
      ),
    ).toEqual(['UserId.Invalid', 'Data.KeyEmpty']);
  });
});
