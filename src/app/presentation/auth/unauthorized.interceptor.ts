import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppPaths } from '@presentation/routing/app-paths';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from './auth.store';

/** Signs the user out when the backend rejects the session (expired or revoked token). */
export const unauthorizedInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  return next(request).pipe(
    catchError((error: unknown) => {
      const isOnLoginPage = router.url.startsWith(AppPaths.login);
      if (isUnauthorized(error) && !isOnLoginPage) {
        void authStore.logout();
      }
      return throwError(() => error);
    }),
  );
};

function isUnauthorized(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized;
}
