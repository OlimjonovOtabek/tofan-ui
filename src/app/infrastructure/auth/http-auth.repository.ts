import { Injectable, inject } from '@angular/core';
import { AuthSession } from '@domain/auth/entities/auth-session';
import { UserProfile } from '@domain/auth/entities/user-profile';
import { InvalidCredentialsError } from '@domain/auth/errors/invalid-credentials.error';
import { SessionExpiredError } from '@domain/auth/errors/session-expired.error';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { Credentials } from '@domain/auth/value-objects/credentials';
import { ApiClient } from '@infrastructure/api/api-client';
import { postAuthLogin } from '@infrastructure/api/generated/fn/auth-authentication/post-auth-login';
import { postAuthLogout } from '@infrastructure/api/generated/fn/auth-authentication/post-auth-logout';
import { postAuthRefresh } from '@infrastructure/api/generated/fn/auth-authentication/post-auth-refresh';
import { toAuthSession, toUserProfile } from './auth.mapper';

/** Error codes the Auth module answers with; see `AuthenticationErrors` in the backend. */
const INVALID_CREDENTIALS_CODE = 'Authentication.InvalidCredentials';
const INVALID_REFRESH_TOKEN_CODE = 'Authentication.InvalidRefreshToken';

@Injectable()
export class HttpAuthRepository implements AuthRepository {
  private readonly apiClient = inject(ApiClient);

  async login(credentials: Credentials): Promise<AuthSession> {
    try {
      const token = await this.apiClient.invokeAnonymously(postAuthLogin, {
        body: { username: credentials.username, password: credentials.password },
      });
      return toAuthSession(token);
    } catch (error) {
      throw hasCode(error, INVALID_CREDENTIALS_CODE) ? new InvalidCredentialsError() : error;
    }
  }

  async renew(session: AuthSession): Promise<AuthSession> {
    if (session.refreshToken === null) {
      throw new SessionExpiredError();
    }

    try {
      const token = await this.apiClient.invokeAnonymously(postAuthRefresh, {
        body: { refreshToken: session.refreshToken },
      });
      return toAuthSession(token);
    } catch (error) {
      throw hasCode(error, INVALID_REFRESH_TOKEN_CODE) ? new SessionExpiredError() : error;
    }
  }

  /** Best effort: the local session is dropped even when Keycloak cannot be reached. */
  async revoke(session: AuthSession): Promise<void> {
    if (session.refreshToken === null) {
      return;
    }
    try {
      await this.apiClient.invoke(postAuthLogout, {
        body: { refreshToken: session.refreshToken },
      });
    } catch {
      // Ignored on purpose: signing out must never fail in the UI.
    }
  }

  readProfile(session: AuthSession): UserProfile {
    return toUserProfile(session);
  }
}

function hasCode(error: unknown, code: string): boolean {
  return error instanceof Error && 'code' in error && error.code === code;
}
