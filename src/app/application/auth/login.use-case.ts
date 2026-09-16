import { UserProfile } from '@domain/auth/entities/user-profile';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { Credentials } from '@domain/auth/value-objects/credentials';
import { AccessDeniedError } from '@domain/shared/errors/access-denied.error';

export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  /**
   * @throws InvalidCredentialsError when the identity provider rejects the credentials.
   * @throws AccessDeniedError when the account exists but is not an admin.
   */
  async execute(username: string, password: string): Promise<UserProfile> {
    const credentials = Credentials.create(username, password);
    const session = await this.authRepository.login(credentials);
    const user = this.authRepository.readProfile(session);

    if (!user.isAdmin()) {
      await this.authRepository.revoke(session);
      throw new AccessDeniedError();
    }

    this.sessionRepository.save(session);
    return user;
  }
}
