import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IsAuthenticatedUseCase } from '@application/auth/is-authenticated.use-case';
import { AppPaths } from '../app-paths';

/** Keeps already signed-in users away from guest-only pages such as login. */
export const guestGuard: CanActivateFn = () => {
  if (!inject(IsAuthenticatedUseCase).execute()) {
    return true;
  }
  return inject(Router).createUrlTree([AppPaths.dashboard]);
};
