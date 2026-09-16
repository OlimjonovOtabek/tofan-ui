import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { SessionRepository } from '@domain/auth/repositories/session.repository';

export class LogoutUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  /** Revokes the session at the identity provider, then forgets it locally. Never fails. */
  async execute(): Promise<void> {
    const session = this.sessionRepository.get();
    try {
      if (session !== null) {
        await this.authRepository.revoke(session);
      }
    } catch {
      // Signing out locally matters more than reaching the backend.
    } finally {
      this.sessionRepository.clear();
    }
  }
}
