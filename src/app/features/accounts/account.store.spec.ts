import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthStore } from '@core/auth/auth.store';
import { UserProfile } from '@core/auth/user-profile';
import { NotificationService } from '@core/feedback/notification.service';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { AccountStore } from './account.store';
import { Account } from './models/account';
import { AccountsService } from './services/accounts.service';

const ACCOUNT_ID = 'd9402f0f-3014-4b6e-b99c-9a79476a4d16';

function account(isActive: boolean): Account {
  return new Account(ACCOUNT_ID, 'ali', null, false, null, isActive, new Date());
}

describe('AccountStore', () => {
  let service: Pick<
    AccountsService,
    'getById' | 'getRoles' | 'block' | 'unblock' | 'logoutEverywhere'
  >;
  let notifications: Pick<NotificationService, 'success' | 'error'>;
  const currentUser = signal<UserProfile | null>(null);

  function createStore(): AccountStore {
    TestBed.configureTestingModule({
      providers: [
        AccountStore,
        { provide: AccountsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
        { provide: AuthStore, useValue: { currentUser } },
      ],
    });
    return TestBed.inject(AccountStore);
  }

  beforeEach(() => {
    currentUser.set(new UserProfile('someone-else', 'admin', 'Admin', ['admin']));
    service = {
      getById: vi.fn().mockResolvedValue(account(true)),
      getRoles: vi.fn().mockResolvedValue(['admin']),
      block: vi.fn().mockResolvedValue(undefined),
      unblock: vi.fn().mockResolvedValue(undefined),
      logoutEverywhere: vi.fn().mockResolvedValue(undefined),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should expose the account and its roles when both requests succeed', async () => {
    const store = createStore();

    await store.load(ACCOUNT_ID);

    expect(store.account()?.userName).toBe('ali');
    expect(store.isAdmin()).toBe(true);
    expect(store.isCurrentUser()).toBe(false);
  });

  it('should recognise the signed-in admin when the card shows their own account', async () => {
    currentUser.set(new UserProfile(ACCOUNT_ID, 'ali', 'Ali', ['admin']));
    const store = createStore();

    await store.load(ACCOUNT_ID);

    expect(store.isCurrentUser()).toBe(true);
  });

  it('should expose the error when the account is missing', async () => {
    vi.mocked(service.getById).mockRejectedValue(new NotFoundError('gone', 'User.NotFound'));
    const store = createStore();

    await store.load(ACCOUNT_ID);

    expect(store.account()).toBeNull();
    expect(store.loadError()).toContain('Hisob topilmadi');
  });

  it('should block and reload the card when the admin blocks the account', async () => {
    const store = createStore();
    await store.load(ACCOUNT_ID);
    vi.mocked(service.getById).mockResolvedValue(account(false));

    await store.run('block');

    expect(service.block).toHaveBeenCalledWith(ACCOUNT_ID);
    expect(notifications.success).toHaveBeenCalled();
    expect(store.account()?.isBlocked()).toBe(true);
    expect(store.runningAction()).toBeNull();
  });

  it('should report the failure and still reload when the backend rejects the action', async () => {
    const store = createStore();
    await store.load(ACCOUNT_ID);
    const rejection = new ConflictError('blocked', 'User.AlreadyBlocked');
    vi.mocked(service.block).mockRejectedValue(rejection);

    await store.run('block');

    expect(notifications.error).toHaveBeenCalledWith(rejection);
    expect(service.getById).toHaveBeenCalledTimes(2);
  });
});
