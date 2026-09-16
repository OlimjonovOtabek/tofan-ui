import { UserProfile } from '@domain/auth/entities/user-profile';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { SessionRepository } from '@domain/auth/repositories/session.repository';

/** Reads the signed-in user from the stored session; there is no `/auth/me` endpoint. */
export class GetCurrentUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  execute(): UserProfile | null {
    const session = this.sessionRepository.get();
    return session === null ? null : this.authRepository.readProfile(session);
  }
}
