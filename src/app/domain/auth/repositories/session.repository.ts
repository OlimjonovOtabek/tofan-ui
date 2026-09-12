import { AuthSession } from '../entities/auth-session';

/** Port to wherever the active session is persisted between page reloads. */
export abstract class SessionRepository {
  abstract get(): AuthSession | null;

  abstract save(session: AuthSession): void;

  abstract clear(): void;
}
