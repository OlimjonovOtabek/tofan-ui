import { ValidationError } from '@domain/shared/errors/validation.error';
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
  it('trims the text and sends no payload when there is none', () => {
    const notification = createCustomNotification({
      ...custom,
      userId: ` ${USER_ID} `,
      title: '  Salom ',
    });

    expect(notification.userId).toBe(USER_ID);
    expect(notification.title).toBe('Salom');
    expect(notification.data).toBeNull();
  });

  it('refuses a recipient that is not a UUID', () => {
    expect(issueCodesOf(() => createCustomNotification({ ...custom, userId: '' }))).toEqual([
      'UserId.Empty',
    ]);
    expect(issueCodesOf(() => createCustomNotification({ ...custom, userId: '42' }))).toEqual([
      'UserId.Invalid',
    ]);
  });

  it('refuses empty or oversized text with the push provider limits', () => {
    expect(
      issueCodesOf(() =>
        createCustomNotification({ ...custom, title: ' ', body: 'x'.repeat(2049) }),
      ),
    ).toEqual(['Title.Empty', 'Body.TooLong']);
    expect(() =>
      createCustomNotification({ ...custom, title: 'x'.repeat(256), body: 'x'.repeat(2048) }),
    ).not.toThrow();
  });

  it('turns the payload rows into a map, skipping rows left blank', () => {
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

  it('refuses a value without a key and a repeated key', () => {
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
  it('needs only a valid recipient and a type', () => {
    expect(
      createTemplatedNotification({ userId: USER_ID, type: 'weeklyReport', data: [] }),
    ).toEqual({ userId: USER_ID, type: 'weeklyReport', data: null });
  });

  it('checks the recipient and the payload the same way', () => {
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
