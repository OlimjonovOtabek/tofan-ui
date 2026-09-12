import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IsAuthenticatedUseCase } from '@application/auth/is-authenticated.use-case';
import { AppPaths } from '../app-paths';

/** Lets only authenticated users through; others go to login and come back afterwards. */
export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(IsAuthenticatedUseCase).execute()) {
    return true;
  }
  return inject(Router).createUrlTree([AppPaths.login], {
    queryParams: { returnUrl: state.url },
  });
};
