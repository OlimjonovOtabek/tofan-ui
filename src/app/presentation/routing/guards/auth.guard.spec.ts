import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';
import { IsAuthenticatedUseCase } from '@application/auth/is-authenticated.use-case';
import { UserProfile } from '@domain/auth/entities/user-profile';
import { Roles } from '@domain/auth/roles';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const admin = new UserProfile('1', 'admin', 'Admin', [Roles.admin]);
  const trainee = new UserProfile('2', 'soldier', 'Soldier', ['user']);

  function runGuard(
    user: UserProfile | null,
    url: string,
    isAuthenticated = user !== null,
  ): MaybeAsync<GuardResult> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: IsAuthenticatedUseCase, useValue: { execute: () => isAuthenticated } },
        { provide: GetCurrentUserUseCase, useValue: { execute: () => user } },
      ],
    });
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );
  }

  it('allows signed-in admins', () => {
    expect(runGuard(admin, '/')).toBe(true);
  });

  it('sends a signed-in user without the admin role to the access denied page', () => {
    const result = runGuard(trainee, '/');

    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/auth/access-denied');
  });

  it('redirects guests to login and remembers where they were going', () => {
    const result = runGuard(null, '/reports?page=2', false);

    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result as UrlTree)).toBe(
      '/auth/login?returnUrl=%2Freports%3Fpage%3D2',
    );
  });
});
