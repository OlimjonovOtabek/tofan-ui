import { Injectable, inject } from '@angular/core';
import { AuthSession } from './auth-session';
import { UserProfile } from './user-profile';
import { InvalidCredentialsError } from './invalid-credentials.error';
import { SessionExpiredError } from './session-expired.error';
import { Credentials } from './credentials';
import { ApiClient } from '@core/http/api-client';
import { AuthTokenResponse, LoginRequest, RefreshTokenRequest } from './auth.dto';
import { toAuthSession, toUserProfile } from './auth.mapper';

const INVALID_CREDENTIALS_CODE = 'Authentication.InvalidCredentials';
const INVALID_REFRESH_TOKEN_CODE = 'Authentication.InvalidRefreshToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiClient = inject(ApiClient);

  async login(credentials: Credentials): Promise<AuthSession> {
    try {
      const body: LoginRequest = {
        username: credentials.username,
        password: credentials.password,
      };
      const token = await this.apiClient.postAnonymously<AuthTokenResponse>('/auth/login', body);
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
      const body: RefreshTokenRequest = { refreshToken: session.refreshToken };
      const token = await this.apiClient.postAnonymously<AuthTokenResponse>('/auth/refresh', body);
      return toAuthSession(token);
    } catch (error) {
      throw hasCode(error, INVALID_REFRESH_TOKEN_CODE) ? new SessionExpiredError() : error;
    }
  }

  async revoke(session: AuthSession): Promise<void> {
    if (session.refreshToken === null) {
      return;
    }
    const body: RefreshTokenRequest = { refreshToken: session.refreshToken };
    await this.apiClient.post('/auth/logout', body).catch(keepSigningOutWhenBackendIsUnreachable);
  }

  readProfile(session: AuthSession): UserProfile {
    return toUserProfile(session);
  }
}

function hasCode(error: unknown, code: string): boolean {
  return error instanceof Error && 'code' in error && error.code === code;
}

function keepSigningOutWhenBackendIsUnreachable(): void {
  return;
}
