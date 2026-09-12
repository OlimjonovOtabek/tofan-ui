import { AuthSession } from '@domain/auth/entities/auth-session';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { Credentials } from '@domain/auth/value-objects/credentials';

export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(username: string, password: string): Promise<AuthSession> {
    const credentials = Credentials.create(username, password);
    const session = await this.authRepository.login(credentials);
    this.sessionRepository.save(session);
    return session;
  }
}
