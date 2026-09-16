import { Page, PageRequest } from '@domain/shared/paging/page';
import { UserSession } from '@domain/user-sessions/entities/user-session';
import { UserSessionRepository } from '@domain/user-sessions/repositories/user-session.repository';

export class GetUserSessionsUseCase {
  constructor(private readonly userSessionRepository: UserSessionRepository) {}

  execute(page: PageRequest): Promise<Page<UserSession>> {
    return this.userSessionRepository.list(page);
  }
}
