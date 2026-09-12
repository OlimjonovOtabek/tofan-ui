import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthSession } from '@domain/auth/entities/auth-session';
import { UserProfile } from '@domain/auth/entities/user-profile';
import { InvalidCredentialsError } from '@domain/auth/errors/invalid-credentials.error';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { Credentials } from '@domain/auth/value-objects/credentials';
import { Api, getCurrentUser, login } from '@infrastructure/api/generated';
import { toAuthSession, toUserProfile } from './auth.mapper';

@Injectable()
export class HttpAuthRepository implements AuthRepository {
  private readonly api = inject(Api);

  async login(credentials: Credentials): Promise<AuthSession> {
    try {
      const response = await this.api.invoke(login, {
        body: { username: credentials.username, password: credentials.password },
      });
      return toAuthSession(response);
    } catch (error) {
      throw isUnauthorized(error) ? new InvalidCredentialsError() : error;
    }
  }

  async getCurrentUser(): Promise<UserProfile> {
    const response = await this.api.invoke(getCurrentUser);
    return toUserProfile(response);
  }
}

function isUnauthorized(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized;
}
