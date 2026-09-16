import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { ApiConfiguration } from '@infrastructure/api/generated/api-configuration';

/** Attaches the bearer token to requests addressed to our own API only. */
export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const apiRootUrl = inject(ApiConfiguration).rootUrl;
  const session = inject(SessionRepository).get();

  if (!request.url.startsWith(apiRootUrl) || session === null || session.isExpired()) {
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${session.accessToken}` } }));
};
