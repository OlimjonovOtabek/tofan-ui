import { AuthSession } from '@domain/auth/entities/auth-session';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
  const session = new AuthSession('token', new Date('2030-01-01'), 'refresh');

  let authRepository: AuthRepository;
  let sessionRepository: SessionRepository;

  beforeEach(() => {
    authRepository = {
      login: vi.fn(),
      renew: vi.fn(),
      revoke: vi.fn().mockResolvedValue(undefined),
      readProfile: vi.fn(),
    };
    sessionRepository = { get: vi.fn().mockReturnValue(session), save: vi.fn(), clear: vi.fn() };
  });

  it('revokes the session at the identity provider and forgets it', async () => {
    await new LogoutUseCase(authRepository, sessionRepository).execute();

    expect(authRepository.revoke).toHaveBeenCalledWith(session);
    expect(sessionRepository.clear).toHaveBeenCalled();
  });

  it('forgets the session even when the backend call fails', async () => {
    vi.mocked(authRepository.revoke).mockRejectedValue(new Error('offline'));

    await expect(
      new LogoutUseCase(authRepository, sessionRepository).execute(),
    ).resolves.toBeUndefined();

    expect(sessionRepository.clear).toHaveBeenCalled();
  });
});
