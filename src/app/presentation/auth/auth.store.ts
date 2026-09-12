import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';
import { LoginUseCase } from '@application/auth/login.use-case';
import { LogoutUseCase } from '@application/auth/logout.use-case';
import { UserProfile } from '@domain/auth/entities/user-profile';
import { AppPaths } from '@presentation/routing/app-paths';

/** View-facing auth state. Components talk to this store, never to use cases directly. */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly router = inject(Router);
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly logoutUseCase = inject(LogoutUseCase);
  private readonly getCurrentUserUseCase = inject(GetCurrentUserUseCase);

  private readonly user = signal<UserProfile | null>(null);

  readonly currentUser = this.user.asReadonly();
  readonly displayName = computed(() => this.user()?.fullName ?? '');

  async login(username: string, password: string): Promise<void> {
    await this.loginUseCase.execute(username, password);
    await this.loadCurrentUser();
  }

  async loadCurrentUser(): Promise<void> {
    this.user.set(await this.getCurrentUserUseCase.execute());
  }

  async logout(): Promise<void> {
    this.logoutUseCase.execute();
    this.user.set(null);
    await this.router.navigateByUrl(AppPaths.login);
  }
}
