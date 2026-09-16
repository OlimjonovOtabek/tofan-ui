import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';
import { IsAuthenticatedUseCase } from '@application/auth/is-authenticated.use-case';
import { LoginUseCase } from '@application/auth/login.use-case';
import { LogoutUseCase } from '@application/auth/logout.use-case';
import { RenewSessionUseCase } from '@application/auth/renew-session.use-case';
import { UserProfile } from '@domain/auth/entities/user-profile';
import { AppPaths } from '@presentation/routing/app-paths';

/** View-facing auth state. Components talk to this store, never to use cases directly. */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly router = inject(Router);
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly logoutUseCase = inject(LogoutUseCase);
  private readonly renewSessionUseCase = inject(RenewSessionUseCase);
  private readonly isAuthenticatedUseCase = inject(IsAuthenticatedUseCase);

  /** Restored from the stored token, so a page reload keeps the user signed in. */
  private readonly user = signal<UserProfile | null>(inject(GetCurrentUserUseCase).execute());
  private isSigningOut = false;

  readonly currentUser = this.user.asReadonly();
  readonly displayName = computed(() => this.user()?.fullName ?? '');
  readonly isAdmin = computed(() => this.user()?.isAdmin() ?? false);

  hasSession(): boolean {
    return this.isAuthenticatedUseCase.execute();
  }

  async login(username: string, password: string): Promise<void> {
    this.user.set(await this.loginUseCase.execute(username, password));
  }

  /** @throws SessionExpiredError when the refresh token is gone or refused. */
  async renewSession(): Promise<void> {
    await this.renewSessionUseCase.execute();
  }

  async logout(): Promise<void> {
    if (this.isSigningOut) {
      return;
    }
    this.isSigningOut = true;
    try {
      await this.logoutUseCase.execute();
      this.user.set(null);
      await this.router.navigateByUrl(AppPaths.login);
    } finally {
      this.isSigningOut = false;
    }
  }
}
