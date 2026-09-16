import { Page, PageRequest } from '@domain/shared/paging/page';
import { UserSession } from '../entities/user-session';

export abstract class UserSessionRepository {
  /** Every user's logins; the backend offers no filter, not even by user. */
  abstract list(page: PageRequest): Promise<Page<UserSession>>;
}
