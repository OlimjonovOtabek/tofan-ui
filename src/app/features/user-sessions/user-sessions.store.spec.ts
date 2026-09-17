import { TestBed } from '@angular/core/testing';
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
