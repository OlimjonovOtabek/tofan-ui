import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSession } from './auth-session';
import { UserProfile } from './user-profile';
import { SessionExpiredError } from './session-expired.error';
import { AuthService } from '@core/auth/auth.service';
import { AuthSessionStorage } from '@core/auth/auth-session.storage';
import { Credentials } from './credentials';
import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { AppPaths } from '@core/config/app-paths';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly authSessionStorage = inject(AuthSessionStorage);

  private readonly user = signal<UserProfile | null>(this.readStoredUser());
  private pendingRenewal: Promise<AuthSession> | null = null;
  private isSigningOut = false;

  readonly currentUser = this.user.asReadonly();
  readonly displayName = computed(() => this.user()?.fullName ?? '');
  readonly isAdmin = computed(() => this.user()?.isAdmin() ?? false);

  hasSession(now: Date = new Date()): boolean {
    return this.authSessionStorage.get()?.isUsable(now) ?? false;
  }

  async login(username: string, password: string): Promise<void> {
    const session = await this.authService.login(Credentials.create(username, password));
    const user = this.authService.readProfile(session);

    if (!user.isAdmin()) {
      await this.authService.revoke(session);
      throw new AccessDeniedError();
    }

    this.authSessionStorage.save(session);
    this.user.set(user);
  }

  renewSession(): Promise<AuthSession> {
    this.pendingRenewal ??= this.renew().finally(() => (this.pendingRenewal = null));
    return this.pendingRenewal;
  }

  async logout(): Promise<void> {
    if (this.isSigningOut) {
      return;
    }
    this.isSigningOut = true;
    try {
      await this.forgetSession();
      this.user.set(null);
      await this.router.navigateByUrl(AppPaths.login);
    } finally {
      this.isSigningOut = false;
    }
  }

  private readStoredUser(): UserProfile | null {
    const session = this.authSessionStorage.get();
    return session === null ? null : this.authService.readProfile(session);
  }

  private async renew(): Promise<AuthSession> {
    const session = this.authSessionStorage.get();
    if (session === null || !session.canBeRenewed()) {
      throw new SessionExpiredError();
    }

    try {
      const renewed = await this.authService.renew(session);
      this.authSessionStorage.save(renewed);
      return renewed;
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        this.authSessionStorage.clear();
      }
      throw error;
    }
  }

  private async forgetSession(): Promise<void> {
    const session = this.authSessionStorage.get();
    if (session !== null) {
      await this.authService.revoke(session).catch(signOutLocallyAnyway);
    }
    this.authSessionStorage.clear();
  }
}

function signOutLocallyAnyway(): void {
  return;
}
