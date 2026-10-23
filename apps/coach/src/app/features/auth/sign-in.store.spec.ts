import { TestBed } from '@angular/core/testing';
import { AuthStore } from '@core/auth/auth.store';
import { InvalidCredentialsError } from '@core/auth/invalid-credentials.error';
import { NotificationService } from '@core/feedback/notification.service';
import { SignInMemoryService } from './services/sign-in-memory.service';
import { SignInStore } from './sign-in.store';

describe('SignInStore', () => {
  const login = vi.fn();
  const save = vi.fn();
  const failure = vi.fn();
  const error = vi.fn();
  let store: SignInStore;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        SignInStore,
        { provide: AuthStore, useValue: { login } },
        {
          provide: SignInMemoryService,
          useValue: { read: () => ({ identifier: 'saved', remember: true }), save },
        },
        { provide: NotificationService, useValue: { failure, error } },
      ],
    });
    store = TestBed.inject(SignInStore);
  });

  it('should prefill the identifier when the coach was remembered', () => {
    expect(store.initialValue()).toEqual({ identifier: 'saved', password: '', remember: true });
  });

  it('should remember the trimmed identifier when the login succeeds', async () => {
    login.mockResolvedValue(undefined);

    const done = await store.signIn({ identifier: ' coach ', password: 'secret', remember: true });

    expect(done).toBe(true);
    expect(login).toHaveBeenCalledWith('coach', 'secret');
    expect(save).toHaveBeenCalledWith({ identifier: 'coach', remember: true });
  });

  it('should show the wrong credentials toast when the login is rejected', async () => {
    login.mockRejectedValue(new InvalidCredentialsError());

    const done = await store.signIn({ identifier: 'coach', password: 'bad', remember: false });

    expect(done).toBe(false);
    expect(failure).toHaveBeenCalledWith('coachApp.signIn.invalidCredentials');
    expect(save).not.toHaveBeenCalled();
    expect(store.signingIn()).toBe(false);
  });

  it('should show the generic error toast when the failure is unexpected', async () => {
    const unexpected = new Error('offline');
    login.mockRejectedValue(unexpected);

    await store.signIn({ identifier: 'coach', password: 'x', remember: false });

    expect(error).toHaveBeenCalledWith(unexpected);
  });
});
