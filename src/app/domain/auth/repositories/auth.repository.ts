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

  /** @throws SessionExpiredError when the refresh token is no longer accepted. */
  abstract renew(session: AuthSession): Promise<AuthSession>;

  /** Revokes the session at the identity provider. Never throws. */
  abstract revoke(session: AuthSession): Promise<void>;

  /** Who the session belongs to. Read from the token itself, so no call goes out. */
  abstract readProfile(session: AuthSession): UserProfile;
}
