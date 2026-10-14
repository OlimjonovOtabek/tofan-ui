import { toAccount } from './account.mapper';

const response = {
  id: 'd9402f0f-3014-4b6e-b99c-9a79476a4d16',
  userName: 'qatarget1789822724',
  email: 'qatarget1789822724@example.test',
  emailVerified: false,
  phoneNumber: null,
  isActive: true,
  registeredOnUtc: '2026-09-19T12:58:45.729+00:00',
};

describe('account mapper', () => {
  it('should map the account and parse the registration time when a response arrives', () => {
    const account = toAccount(response);

    expect(account.id).toBe(response.id);
    expect(account.userName).toBe('qatarget1789822724');
    expect(account.email).toBe('qatarget1789822724@example.test');
    expect(account.registeredAt.toISOString()).toBe('2026-09-19T12:58:45.729Z');
    expect(account.isBlocked()).toBe(false);
  });

  it('should treat a missing or empty contact as absent when the backend omits it', () => {
    const account = toAccount({ ...response, email: '', phoneNumber: undefined, isActive: false });

    expect(account.email).toBeNull();
    expect(account.phoneNumber).toBeNull();
    expect(account.isBlocked()).toBe(true);
  });
});
