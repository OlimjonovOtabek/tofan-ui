import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideApiConfiguration } from '@infrastructure/api/generated/api-configuration';
import { authTokenInterceptor } from '@infrastructure/http/auth-token.interceptor';
import { sessionInterceptor } from '@presentation/auth/session.interceptor';

export function provideHttp(apiBaseUrl: string): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideApiConfiguration(apiBaseUrl),
    // `sessionInterceptor` wraps the call, so its retry runs through `authTokenInterceptor` again
    // and picks up the renewed token.
    provideHttpClient(withFetch(), withInterceptors([sessionInterceptor, authTokenInterceptor])),
  ]);
}
