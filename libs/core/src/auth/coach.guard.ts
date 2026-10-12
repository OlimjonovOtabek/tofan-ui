import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { AuthPaths } from './auth-paths';

export const coachGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  if (!authStore.hasSession()) {
    return router.createUrlTree([AuthPaths.login], { queryParams: { returnUrl: state.url } });
  }

  return authStore.isTrainer() || router.createUrlTree([AuthPaths.accessDenied]);
};
