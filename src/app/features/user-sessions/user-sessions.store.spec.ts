import { TestBed } from '@angular/core/testing';
import { UserSession } from './models/user-session';
import { UserSessionsService } from './services/user-sessions.service';
import { UserSessionsStore } from './user-sessions.store';

const USER_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

const session = new UserSession(
  '1',
  USER_ID,
  new Date('2026-09-16T08:00:00Z'),
  new Date('2026-12-15T08:00:00Z'),
  null,
);

describe('UserSessionsStore', () => {
  let service: Pick<UserSessionsService, 'list'>;

  function createStore(): UserSessionsStore {
    TestBed.configureTestingModule({
      providers: [UserSessionsStore, { provide: UserSessionsService, useValue: service }],
    });
    return TestBed.inject(UserSessionsStore);
  }

  beforeEach(() => {
    service = { list: vi.fn().mockResolvedValue({ items: [session], totalCount: 1 }) };
  });

  it('should expose the page when the service answers', async () => {
    const store = createStore();

    await store.load({ first: 25, rows: 25 });

    expect(store.sessions()).toEqual([session]);
    expect(store.totalCount()).toBe(1);
    expect(store.first()).toBe(25);
    expect(store.loading()).toBe(false);
  });

  it('should only remember the user when the filter arrives before the first page', async () => {
    const store = createStore();

    await store.filterByUser(USER_ID);

    expect(service.list).not.toHaveBeenCalled();
    await store.load({ first: 0, rows: 25 });
    expect(service.list).toHaveBeenCalledWith({ userId: USER_ID }, { first: 0, rows: 25 });
  });

  it('should reload from the first page when the user filter changes later', async () => {
    const store = createStore();
    await store.load({ first: 50, rows: 25, sortField: 'createdOnUtc', sortDirection: 'desc' });

    await store.filterByUser(USER_ID);
    await store.filterByUser(USER_ID);

    expect(service.list).toHaveBeenCalledTimes(2);
    expect(service.list).toHaveBeenLastCalledWith(
      { userId: USER_ID },
      { first: 0, rows: 25, sortField: 'createdOnUtc', sortDirection: 'desc' },
    );
  });

  it('should expose the error and drop the old rows when a reload fails', async () => {
    const store = createStore();
    await store.load();
    vi.mocked(service.list).mockRejectedValue(new Error('offline'));

    await store.load();

    expect(store.loadError()).not.toBeNull();
    expect(store.sessions()).toEqual([]);
    expect(store.loading()).toBe(false);
  });
});
