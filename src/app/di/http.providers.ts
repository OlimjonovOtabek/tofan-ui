import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideApiConfiguration } from '@infrastructure/api/generated/api-configuration';
import { authTokenInterceptor } from '@infrastructure/http/auth-token.interceptor';
import { unauthorizedInterceptor } from '@presentation/auth/unauthorized.interceptor';

export function provideHttp(apiBaseUrl: string): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideApiConfiguration(apiBaseUrl),
    provideHttpClient(
      withFetch(),
      withInterceptors([authTokenInterceptor, unauthorizedInterceptor]),
    ),
  ]);
}
