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
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  function runGuard(hasSession: boolean): MaybeAsync<GuardResult> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: { hasSession: () => hasSession } },
      ],
    });
    return TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  it('should open the login page when nobody is signed in', () => {
    expect(runGuard(false)).toBe(true);
  });

  it('should send the user to the dashboard when a session exists', () => {
    const result = runGuard(true);

    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/');
  });
});
