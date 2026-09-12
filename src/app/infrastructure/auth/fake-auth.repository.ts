import { Injectable } from '@angular/core';
import { AuthSession } from '@domain/auth/entities/auth-session';
import { UserProfile } from '@domain/auth/entities/user-profile';
import { InvalidCredentialsError } from '@domain/auth/errors/invalid-credentials.error';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { Credentials } from '@domain/auth/value-objects/credentials';

export const FAKE_USERNAME = 'admin';
export const FAKE_PASSWORD = 'admin';

const FAKE_SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;
const FAKE_NETWORK_DELAY_MS = 300;

/** In-memory stand-in for the backend, enabled with `environment.useMockApi`. */
@Injectable()
export class FakeAuthRepository implements AuthRepository {
  async login(credentials: Credentials): Promise<AuthSession> {
    await simulateNetworkDelay();

    if (credentials.username !== FAKE_USERNAME || credentials.password !== FAKE_PASSWORD) {
      throw new InvalidCredentialsError();
    }

    const expiresAt = new Date(Date.now() + FAKE_SESSION_LIFETIME_MS);
    return new AuthSession('fake-access-token', expiresAt);
  }

  async getCurrentUser(): Promise<UserProfile> {
    await simulateNetworkDelay();
    return new UserProfile('1', FAKE_USERNAME, 'Tofan Administrator', ['ADMIN']);
  }
}

function simulateNetworkDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, FAKE_NETWORK_DELAY_MS));
}
