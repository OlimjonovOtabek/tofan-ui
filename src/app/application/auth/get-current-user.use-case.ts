import { UserProfile } from '@domain/auth/entities/user-profile';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';

export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): Promise<UserProfile> {
    return this.authRepository.getCurrentUser();
  }
}
