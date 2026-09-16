import { signal } from '@angular/core';
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
import { AuthStore } from './auth.store';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  function runGuard(hasSession: boolean, isAdmin: boolean, url: string): MaybeAsync<GuardResult> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: { hasSession: () => hasSession, isAdmin: signal(isAdmin) },
        },
      ],
    });
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );
  }

  it('should allow the route when an admin is signed in', () => {
    expect(runGuard(true, true, '/')).toBe(true);
  });

  it('should send the user to the access denied page when they are not an admin', () => {
    const result = runGuard(true, false, '/');

    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/auth/access-denied');
  });

  it('should redirect to login and remember the target when nobody is signed in', () => {
    const result = runGuard(false, false, '/reports?page=2');

    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(
      '/auth/login?returnUrl=%2Freports%3Fpage%3D2',
    );
  });
});
