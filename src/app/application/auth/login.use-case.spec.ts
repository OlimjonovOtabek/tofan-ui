import { AuthSession } from '@domain/auth/entities/auth-session';
import { InvalidCredentialsError } from '@domain/auth/errors/invalid-credentials.error';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { ValidationError } from '@domain/shared/errors/validation.error';
import { LoginUseCase } from './login.use-case';

describe('LoginUseCase', () => {
  const session = new AuthSession('token', new Date('2030-01-01'));

  let authRepository: AuthRepository;
  let sessionRepository: SessionRepository;
  let useCase: LoginUseCase;

  beforeEach(() => {
    authRepository = { login: vi.fn().mockResolvedValue(session), getCurrentUser: vi.fn() };
    sessionRepository = { get: vi.fn(), save: vi.fn(), clear: vi.fn() };
    useCase = new LoginUseCase(authRepository, sessionRepository);
  });

  it('stores the session returned by the identity provider', async () => {
    await expect(useCase.execute(' admin ', 'secret')).resolves.toBe(session);

    expect(authRepository.login).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'admin', password: 'secret' }),
    );
    expect(sessionRepository.save).toHaveBeenCalledWith(session);
  });

  it('does not call the backend when credentials are incomplete', async () => {
    await expect(useCase.execute('', 'secret')).rejects.toThrow(ValidationError);

    expect(authRepository.login).not.toHaveBeenCalled();
  });

  it('does not store anything when credentials are rejected', async () => {
    vi.mocked(authRepository.login).mockRejectedValue(new InvalidCredentialsError());

    await expect(useCase.execute('admin', 'wrong')).rejects.toThrow(InvalidCredentialsError);

    expect(sessionRepository.save).not.toHaveBeenCalled();
  });
});
