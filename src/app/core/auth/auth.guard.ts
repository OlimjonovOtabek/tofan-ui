import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { AppPaths } from '@core/config/app-paths';

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  if (!authStore.hasSession()) {
    return router.createUrlTree([AppPaths.login], { queryParams: { returnUrl: state.url } });
  }

  return authStore.isAdmin() || router.createUrlTree([AppPaths.accessDenied]);
};
