import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';
import { IsAuthenticatedUseCase } from '@application/auth/is-authenticated.use-case';
import { LoginUseCase } from '@application/auth/login.use-case';
import { LogoutUseCase } from '@application/auth/logout.use-case';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { FakeAuthRepository } from '@infrastructure/auth/fake-auth.repository';
import { HttpAuthRepository } from '@infrastructure/auth/http-auth.repository';
import { LocalStorageSessionRepository } from '@infrastructure/auth/local-storage-session.repository';

export interface AuthProvidersOptions {
  readonly useMockApi: boolean;
}

/** Binds auth ports to their adapters and wires the framework-agnostic use cases. */
export function provideAuth({ useMockApi }: AuthProvidersOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AuthRepository, useClass: useMockApi ? FakeAuthRepository : HttpAuthRepository },
    { provide: SessionRepository, useClass: LocalStorageSessionRepository },
    {
      provide: LoginUseCase,
      useFactory: () => new LoginUseCase(inject(AuthRepository), inject(SessionRepository)),
    },
    { provide: LogoutUseCase, useFactory: () => new LogoutUseCase(inject(SessionRepository)) },
    {
      provide: IsAuthenticatedUseCase,
      useFactory: () => new IsAuthenticatedUseCase(inject(SessionRepository)),
    },
    {
      provide: GetCurrentUserUseCase,
      useFactory: () => new GetCurrentUserUseCase(inject(AuthRepository)),
    },
  ]);
}
