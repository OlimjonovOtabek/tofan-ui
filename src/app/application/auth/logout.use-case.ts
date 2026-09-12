import { SessionRepository } from '@domain/auth/repositories/session.repository';

export class LogoutUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  execute(): void {
    this.sessionRepository.clear();
  }
}
