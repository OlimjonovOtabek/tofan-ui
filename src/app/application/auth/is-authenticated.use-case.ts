import { SessionRepository } from '@domain/auth/repositories/session.repository';

export class IsAuthenticatedUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  execute(now: Date = new Date()): boolean {
    return this.sessionRepository.get()?.isUsable(now) ?? false;
  }
}
