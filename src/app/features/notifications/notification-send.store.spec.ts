import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { NotificationTemplate } from './models/notification-template';
import { NotificationType, TrainerStyle } from './models/notification-attributes';
import { CustomNotificationInput } from './models/outgoing-notification';
import { NotificationSendStore } from './notification-send.store';
import { NotificationTemplatesService } from './services/notification-templates.service';
import { PushNotificationsService } from './services/push-notifications.service';

const USER_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

const custom: CustomNotificationInput = {
  userId: USER_ID,
  type: 'workoutReminder',
  title: ' Salom ',
  body: 'Bugungi mashg‘ulotingiz sizni kutmoqda.',
  data: [],
};

function template(
  type: NotificationType,
  style: TrainerStyle,
  isActive = true,
): NotificationTemplate {
  const now = new Date('2026-09-16T00:00:00Z');
  return new NotificationTemplate(
    `${type}-${style}`,
    type,
    style,
    't',
    't',
    't',
    'b',
    'b',
    'b',
    isActive,
    now,
    now,
  );
}

describe('NotificationSendStore', () => {
  let templatesService: Pick<NotificationTemplatesService, 'list'>;
  let pushService: Pick<PushNotificationsService, 'sendCustom' | 'sendTemplated'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  function createStore(): NotificationSendStore {
    TestBed.configureTestingModule({
      providers: [
        NotificationSendStore,
        { provide: NotificationTemplatesService, useValue: templatesService },
        { provide: PushNotificationsService, useValue: pushService },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(NotificationSendStore);
  }

  beforeEach(() => {
    templatesService = {
      list: vi.fn().mockResolvedValue({
        items: [
          template('workoutReminder', 'professional'),
          template('workoutReminder', 'soft', false),
          template('waterReminder', 'soft'),
        ],
        totalCount: 3,
      }),
    };
    pushService = {
      sendCustom: vi.fn().mockResolvedValue('delivery-1'),
      sendTemplated: vi.fn().mockResolvedValue('delivery-2'),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should load every template when the screen opens', async () => {
    const store = createStore();

    await store.loadTemplates();

    expect(templatesService.list).toHaveBeenCalledWith({ first: 0, rows: 1000 });
    expect(store.templatesLoaded()).toBe(true);
  });

  it('should offer the active professional template when previewing a type', async () => {
    const store = createStore();
    await store.loadTemplates();

    expect(store.fallbackTemplate('workoutReminder')?.id).toBe('workoutReminder-professional');
    expect(store.fallbackTemplate('waterReminder')).toBeNull();
  });

  it('should keep templates unloaded and expose the error when the list fails', async () => {
    vi.mocked(templatesService.list).mockRejectedValue(new Error('offline'));
    const store = createStore();

    await store.loadTemplates();

    expect(store.templatesLoaded()).toBe(false);
    expect(store.templatesLoading()).toBe(false);
    expect(store.templatesError()).not.toBeNull();
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('should clear the error when loading the templates again succeeds', async () => {
    vi.mocked(templatesService.list).mockRejectedValueOnce(new Error('offline'));
    const store = createStore();
    await store.loadTemplates();

    await store.loadTemplates();

    expect(store.templatesError()).toBeNull();
    expect(store.templatesLoaded()).toBe(true);
  });

  it('should send a trimmed custom notification and confirm the delivery', async () => {
    const store = createStore();

    await expect(store.sendCustom(custom)).resolves.toBe(true);

    expect(pushService.sendCustom).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Salom' }),
    );
    expect(notifications.success).toHaveBeenCalledWith(expect.stringContaining('delivery-1'));
    expect(store.sending()).toBe(false);
  });

  it('should not call the backend when the user id is not a uuid', async () => {
    const store = createStore();

    await expect(
      store.sendTemplated({ userId: 'nope', type: 'workoutReminder', data: [] }),
    ).resolves.toBe(false);

    expect(pushService.sendTemplated).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
  });
});
