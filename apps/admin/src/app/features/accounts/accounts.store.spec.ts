import { TestBed } from '@angular/core/testing';
import { AccountsStore } from './accounts.store';
import { Account } from './models/account';
import { AccountsService } from './services/accounts.service';

const account = new Account(
  'd9402f0f-3014-4b6e-b99c-9a79476a4d16',
  'ali',
  'ali@example.test',
  true,
  null,
  true,
  new Date('2026-09-19T12:00:00Z'),
);

describe('AccountsStore', () => {
  let service: Pick<AccountsService, 'list'>;

  function createStore(): AccountsStore {
    TestBed.configureTestingModule({
      providers: [AccountsStore, { provide: AccountsService, useValue: service }],
    });
    return TestBed.inject(AccountsStore);
  }

  beforeEach(() => {
    service = { list: vi.fn().mockResolvedValue({ items: [account], totalCount: 1 }) };
  });

  it('should expose the page when the service answers', async () => {
    const store = createStore();

    await store.load({ first: 0, rows: 25 });

    expect(store.accounts()).toEqual([account]);
    expect(store.totalCount()).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('should restart from the first page with the filter when the filter changes', async () => {
    const store = createStore();
    await store.load({ first: 50, rows: 25 });

    await store.applyFilter({ isActive: false, role: 'admin' });

    expect(service.list).toHaveBeenLastCalledWith(
      { isActive: false, role: 'admin' },
      { first: 0, rows: 25 },
    );
    expect(store.first()).toBe(0);
  });

  it('should expose the error and drop the old rows when a reload fails', async () => {
    const store = createStore();
    await store.load();
    vi.mocked(service.list).mockRejectedValue(new Error('offline'));

    await store.load();

    expect(store.loadError()).not.toBeNull();
    expect(store.accounts()).toEqual([]);
  });
});
