import { SessionRepository } from '@domain/auth/repositories/session.repository';

export class IsAuthenticatedUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  execute(now: Date = new Date()): boolean {
    const session = this.sessionRepository.get();
    return session !== null && !session.isExpired(now);
  }
}
