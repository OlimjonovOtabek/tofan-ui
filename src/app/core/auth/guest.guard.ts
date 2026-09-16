import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { AppPaths } from '@core/config/app-paths';

export const guestGuard: CanActivateFn = () => {
  if (!inject(AuthStore).hasSession()) {
    return true;
  }
  return inject(Router).createUrlTree([AppPaths.dashboard]);
};
