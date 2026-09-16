import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';
import { IsAuthenticatedUseCase } from '@application/auth/is-authenticated.use-case';
import { AppPaths } from '../app-paths';

/** Lets only signed-in admins through: guests go to login, everyone else to the access denied page. */
export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);

  if (!inject(IsAuthenticatedUseCase).execute()) {
    return router.createUrlTree([AppPaths.login], { queryParams: { returnUrl: state.url } });
  }

  const user = inject(GetCurrentUserUseCase).execute();
  return user?.isAdmin() === true || router.createUrlTree([AppPaths.accessDenied]);
};
