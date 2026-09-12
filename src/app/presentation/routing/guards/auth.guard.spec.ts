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
import { IsAuthenticatedUseCase } from '@application/auth/is-authenticated.use-case';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  function runGuard(isAuthenticated: boolean, url: string): MaybeAsync<GuardResult> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: IsAuthenticatedUseCase, useValue: { execute: () => isAuthenticated } },
      ],
    });
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );
  }

  it('allows authenticated users', () => {
    expect(runGuard(true, '/')).toBe(true);
  });

  it('redirects guests to login and remembers where they were going', () => {
    const result = runGuard(false, '/reports?page=2');

    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result as UrlTree)).toBe(
      '/auth/login?returnUrl=%2Freports%3Fpage%3D2',
    );
  });
});
