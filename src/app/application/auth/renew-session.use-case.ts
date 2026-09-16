import { AuthSession } from '@domain/auth/entities/auth-session';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { SessionExpiredError } from '@domain/auth/errors/session-expired.error';

/**
 * Exchanges the refresh token for a fresh access token. Parallel callers (several requests failing
 * with 401 at once) share a single renewal instead of racing each other.
 */
export class RenewSessionUseCase {
  private pending: Promise<AuthSession> | null = null;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  /** @throws SessionExpiredError when there is nothing left to renew, or the backend refuses. */
  execute(): Promise<AuthSession> {
    this.pending ??= this.renew().finally(() => (this.pending = null));
    return this.pending;
  }

  private async renew(): Promise<AuthSession> {
    const session = this.sessionRepository.get();
    if (session === null || !session.canBeRenewed()) {
      throw new SessionExpiredError();
    }

    try {
      const renewed = await this.authRepository.renew(session);
      this.sessionRepository.save(renewed);
      return renewed;
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        this.sessionRepository.clear();
      }
      throw error;
    }
  }
}
