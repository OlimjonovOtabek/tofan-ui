import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppPaths } from '@presentation/routing/app-paths';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthStore } from './auth.store';

/**
 * Keeps the session alive: a request rejected with 401 is retried once with a renewed token,
 * and the user is signed out only when the renewal itself fails.
 */
export const sessionInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (hasStatus(error, HttpStatusCode.Forbidden)) {
        void router.navigateByUrl(AppPaths.accessDenied);
        return throwError(() => error);
      }
      if (!hasStatus(error, HttpStatusCode.Unauthorized) || !authStore.hasSession()) {
        return throwError(() => error);
      }

      return from(authStore.renewSession()).pipe(
        switchMap(() => next(request)),
        catchError((renewalError: unknown) => {
          void authStore.logout();
          return throwError(() => renewalError);
        }),
      );
    }),
  );
};

function hasStatus(error: unknown, status: HttpStatusCode): boolean {
  return error instanceof HttpErrorResponse && error.status === status;
}
