import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { UserSession } from './models/user-session';
import { UserSessionsService } from './services/user-sessions.service';
import { UserSessionsStore } from './user-sessions.store';

const session = new UserSession(
  '1',
  '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  new Date('2026-09-16T08:00:00Z'),
  new Date('2026-12-15T08:00:00Z'),
  null,
);

describe('UserSessionsStore', () => {
  let service: Pick<UserSessionsService, 'list'>;
  let notifications: Pick<NotificationService, 'error'>;

  function createStore(): UserSessionsStore {
    TestBed.configureTestingModule({
      providers: [
        UserSessionsStore,
        { provide: UserSessionsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(UserSessionsStore);
  }

  beforeEach(() => {
    service = { list: vi.fn().mockResolvedValue({ items: [session], totalCount: 1 }) };
    notifications = { error: vi.fn() };
  });

  it('should expose the page when the service answers', async () => {
    const store = createStore();

    await store.load({ first: 25, rows: 25 });

    expect(store.sessions()).toEqual([session]);
    expect(store.totalCount()).toBe(1);
    expect(store.first()).toBe(25);
    expect(store.loading()).toBe(false);
  });

  it('should show the error and keep the list empty when loading fails', async () => {
    vi.mocked(service.list).mockRejectedValue(new Error('offline'));
    const store = createStore();

    await store.load();

    expect(store.sessions()).toEqual([]);
    expect(notifications.error).toHaveBeenCalled();
    expect(store.loading()).toBe(false);
  });
});
