import { AuthSession } from '@domain/auth/entities/auth-session';
import { SessionExpiredError } from '@domain/auth/errors/session-expired.error';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { ServiceUnavailableError } from '@domain/shared/errors/service-unavailable.error';
import { RenewSessionUseCase } from './renew-session.use-case';

describe('RenewSessionUseCase', () => {
  const stored = new AuthSession('old', new Date('2020-01-01'), 'refresh', new Date('2030-01-01'));
  const renewed = new AuthSession(
    'new',
    new Date('2030-01-01'),
    'refresh-2',
    new Date('2031-01-01'),
  );

  let authRepository: AuthRepository;
  let sessionRepository: SessionRepository;
  let useCase: RenewSessionUseCase;

  beforeEach(() => {
    authRepository = {
      login: vi.fn(),
      renew: vi.fn().mockResolvedValue(renewed),
      revoke: vi.fn(),
      readProfile: vi.fn(),
    };
    sessionRepository = { get: vi.fn().mockReturnValue(stored), save: vi.fn(), clear: vi.fn() };
    useCase = new RenewSessionUseCase(authRepository, sessionRepository);
  });

  it('stores the renewed session', async () => {
    await expect(useCase.execute()).resolves.toBe(renewed);

    expect(sessionRepository.save).toHaveBeenCalledWith(renewed);
  });

  it('renews only once for callers that arrive together', async () => {
    const [first, second] = await Promise.all([useCase.execute(), useCase.execute()]);

    expect(first).toBe(second);
    expect(authRepository.renew).toHaveBeenCalledTimes(1);
  });

  it('renews again after the previous renewal settled', async () => {
    await useCase.execute();
    await useCase.execute();

    expect(authRepository.renew).toHaveBeenCalledTimes(2);
  });

  it('fails without touching the backend when there is nothing to renew', async () => {
    vi.mocked(sessionRepository.get).mockReturnValue(
      new AuthSession('old', new Date('2020-01-01')),
    );

    await expect(useCase.execute()).rejects.toThrow(SessionExpiredError);

    expect(authRepository.renew).not.toHaveBeenCalled();
  });

  it('drops the session when the refresh token is refused', async () => {
    vi.mocked(authRepository.renew).mockRejectedValue(new SessionExpiredError());

    await expect(useCase.execute()).rejects.toThrow(SessionExpiredError);

    expect(sessionRepository.clear).toHaveBeenCalled();
  });

  it('keeps the session when the backend is merely unreachable', async () => {
    vi.mocked(authRepository.renew).mockRejectedValue(new ServiceUnavailableError());

    await expect(useCase.execute()).rejects.toThrow(ServiceUnavailableError);

    expect(sessionRepository.clear).not.toHaveBeenCalled();
  });
});
