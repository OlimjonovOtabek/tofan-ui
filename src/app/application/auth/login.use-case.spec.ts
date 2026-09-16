import { AuthSession } from '@domain/auth/entities/auth-session';
import { UserProfile } from '@domain/auth/entities/user-profile';
import { InvalidCredentialsError } from '@domain/auth/errors/invalid-credentials.error';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { Roles } from '@domain/auth/roles';
import { AccessDeniedError } from '@domain/shared/errors/access-denied.error';
import { ValidationError } from '@domain/shared/errors/validation.error';
import { LoginUseCase } from './login.use-case';

describe('LoginUseCase', () => {
  const session = new AuthSession('token', new Date('2030-01-01'), 'refresh');
  const admin = new UserProfile('1', 'admin', 'Admin', [Roles.admin]);
  const trainee = new UserProfile('2', 'soldier', 'Soldier', ['user']);

  let authRepository: AuthRepository;
  let sessionRepository: SessionRepository;
  let useCase: LoginUseCase;

  beforeEach(() => {
    authRepository = {
      login: vi.fn().mockResolvedValue(session),
      renew: vi.fn(),
      revoke: vi.fn().mockResolvedValue(undefined),
      readProfile: vi.fn().mockReturnValue(admin),
    };
    sessionRepository = { get: vi.fn(), save: vi.fn(), clear: vi.fn() };
    useCase = new LoginUseCase(authRepository, sessionRepository);
  });

  it('stores the session of an admin and answers with the profile', async () => {
    await expect(useCase.execute(' admin ', 'secret')).resolves.toBe(admin);

    expect(authRepository.login).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'admin', password: 'secret' }),
    );
    expect(sessionRepository.save).toHaveBeenCalledWith(session);
  });

  it('rejects an account without the admin role and revokes its fresh session', async () => {
    vi.mocked(authRepository.readProfile).mockReturnValue(trainee);

    await expect(useCase.execute('soldier', 'secret')).rejects.toThrow(AccessDeniedError);

    expect(authRepository.revoke).toHaveBeenCalledWith(session);
    expect(sessionRepository.save).not.toHaveBeenCalled();
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
