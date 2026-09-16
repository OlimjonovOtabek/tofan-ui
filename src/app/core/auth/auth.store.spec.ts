import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthSession } from './auth-session';
import { UserProfile } from './user-profile';
import { InvalidCredentialsError } from './invalid-credentials.error';
import { SessionExpiredError } from './session-expired.error';
import { AuthService } from '@core/auth/auth.service';
import { AuthSessionStorage } from '@core/auth/auth-session.storage';
import { Roles } from './roles';
import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { ValidationError } from '@shared/models/errors/validation.error';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  const session = new AuthSession('token', new Date('2030-01-01'), 'refresh');
  const admin = new UserProfile('1', 'admin', 'Admin', [Roles.admin]);
  const trainee = new UserProfile('2', 'soldier', 'Soldier', ['user']);

  let authService: Pick<AuthService, 'login' | 'renew' | 'revoke' | 'readProfile'>;
  let authSessionStorage: Pick<AuthSessionStorage, 'get' | 'save' | 'clear'>;

  function createStore(): AuthStore {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigateByUrl: vi.fn().mockResolvedValue(true) } },
        { provide: AuthService, useValue: authService },
        { provide: AuthSessionStorage, useValue: authSessionStorage },
      ],
    });
    return TestBed.inject(AuthStore);
  }

  beforeEach(() => {
    authService = {
      login: vi.fn().mockResolvedValue(session),
      renew: vi.fn(),
      revoke: vi.fn().mockResolvedValue(undefined),
      readProfile: vi.fn().mockReturnValue(admin),
    };
    authSessionStorage = { get: vi.fn().mockReturnValue(null), save: vi.fn(), clear: vi.fn() };
  });

  describe('login', () => {
    it('should store the session and expose the profile when an admin signs in', async () => {
      const store = createStore();

      await store.login(' admin ', 'secret');

      expect(authService.login).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'admin', password: 'secret' }),
      );
      expect(authSessionStorage.save).toHaveBeenCalledWith(session);
      expect(store.currentUser()).toBe(admin);
    });

    it('should revoke the fresh session when the account is not an admin', async () => {
      vi.mocked(authService.readProfile).mockReturnValue(trainee);
      const store = createStore();

      await expect(store.login('soldier', 'secret')).rejects.toThrow(AccessDeniedError);

      expect(authService.revoke).toHaveBeenCalledWith(session);
      expect(authSessionStorage.save).not.toHaveBeenCalled();
    });

    it('should not call the backend when credentials are incomplete', async () => {
      const store = createStore();

      await expect(store.login('', 'secret')).rejects.toThrow(ValidationError);

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should store nothing when credentials are rejected', async () => {
      vi.mocked(authService.login).mockRejectedValue(new InvalidCredentialsError());
      const store = createStore();

      await expect(store.login('admin', 'wrong')).rejects.toThrow(InvalidCredentialsError);

      expect(authSessionStorage.save).not.toHaveBeenCalled();
    });
  });

  describe('hasSession', () => {
    const now = new Date('2026-01-01T12:00:00Z');

    function storeWith(stored: AuthSession | null): AuthStore {
      vi.mocked(authSessionStorage.get).mockReturnValue(stored);
      return createStore();
    }

    it('should be false when there is no session', () => {
      expect(storeWith(null).hasSession(now)).toBe(false);
    });

    it('should be false when the session expired and cannot be renewed', () => {
      expect(
        storeWith(new AuthSession('token', new Date('2026-01-01T11:00:00Z'))).hasSession(now),
      ).toBe(false);
    });

    it('should be true when the refresh token is still alive', () => {
      const stored = new AuthSession(
        'token',
        new Date('2026-01-01T11:00:00Z'),
        'refresh',
        new Date('2026-01-01T18:00:00Z'),
      );

      expect(storeWith(stored).hasSession(now)).toBe(true);
    });
  });

  describe('renewSession', () => {
    const stored = new AuthSession(
      'old',
      new Date('2020-01-01'),
      'refresh',
      new Date('2030-01-01'),
    );
    const renewed = new AuthSession(
      'new',
      new Date('2030-01-01'),
      'refresh-2',
      new Date('2031-01-01'),
    );

    beforeEach(() => {
      vi.mocked(authSessionStorage.get).mockReturnValue(stored);
      vi.mocked(authService.renew).mockResolvedValue(renewed);
    });

    it('should store the renewed session when the backend accepts the refresh token', async () => {
      await expect(createStore().renewSession()).resolves.toBe(renewed);

      expect(authSessionStorage.save).toHaveBeenCalledWith(renewed);
    });

    it('should renew only once when callers arrive together', async () => {
      const store = createStore();

      const [first, second] = await Promise.all([store.renewSession(), store.renewSession()]);

      expect(first).toBe(second);
      expect(authService.renew).toHaveBeenCalledTimes(1);
    });

    it('should renew again when the previous renewal has settled', async () => {
      const store = createStore();

      await store.renewSession();
      await store.renewSession();

      expect(authService.renew).toHaveBeenCalledTimes(2);
    });

    it('should fail without calling the backend when there is nothing to renew', async () => {
      vi.mocked(authSessionStorage.get).mockReturnValue(
        new AuthSession('old', new Date('2020-01-01')),
      );

      await expect(createStore().renewSession()).rejects.toThrow(SessionExpiredError);

      expect(authService.renew).not.toHaveBeenCalled();
    });

    it('should drop the session when the refresh token is refused', async () => {
      vi.mocked(authService.renew).mockRejectedValue(new SessionExpiredError());

      await expect(createStore().renewSession()).rejects.toThrow(SessionExpiredError);

      expect(authSessionStorage.clear).toHaveBeenCalled();
    });

    it('should keep the session when the backend is unreachable', async () => {
      vi.mocked(authService.renew).mockRejectedValue(new ServiceUnavailableError());

      await expect(createStore().renewSession()).rejects.toThrow(ServiceUnavailableError);

      expect(authSessionStorage.clear).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      vi.mocked(authSessionStorage.get).mockReturnValue(session);
    });

    it('should revoke and forget the session when signing out', async () => {
      const store = createStore();

      await store.logout();

      expect(authService.revoke).toHaveBeenCalledWith(session);
      expect(authSessionStorage.clear).toHaveBeenCalled();
      expect(store.currentUser()).toBeNull();
    });

    it('should forget the session when the backend call fails', async () => {
      vi.mocked(authService.revoke).mockRejectedValue(new Error('offline'));
      const store = createStore();

      await expect(store.logout()).resolves.toBeUndefined();

      expect(authSessionStorage.clear).toHaveBeenCalled();
    });
  });
});
