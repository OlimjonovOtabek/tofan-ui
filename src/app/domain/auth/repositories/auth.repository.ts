import { AuthSession } from '../entities/auth-session';
import { UserProfile } from '../entities/user-profile';
import { Credentials } from '../value-objects/credentials';

/**
 * Port to the identity provider. Declared as an abstract class (not an interface)
 * so it can be used as an Angular DI token without leaking Angular into the domain.
 */
export abstract class AuthRepository {
  /** @throws InvalidCredentialsError when the credentials are rejected. */
  abstract login(credentials: Credentials): Promise<AuthSession>;

  abstract getCurrentUser(): Promise<UserProfile>;
}
