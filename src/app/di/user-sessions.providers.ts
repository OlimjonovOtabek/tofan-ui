import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { GetUserSessionsUseCase } from '@application/user-sessions/get-user-sessions.use-case';
import { UserSessionRepository } from '@domain/user-sessions/repositories/user-session.repository';
import { FakeUserSessionRepository } from '@infrastructure/user-sessions/fake-user-session.repository';
import { HttpUserSessionRepository } from '@infrastructure/user-sessions/http-user-session.repository';

export interface UserSessionsProvidersOptions {
  readonly useMockApi: boolean;
}

export function provideUserSessions({
  useMockApi,
}: UserSessionsProvidersOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: UserSessionRepository,
      useClass: useMockApi ? FakeUserSessionRepository : HttpUserSessionRepository,
    },
    {
      provide: GetUserSessionsUseCase,
      useFactory: () => new GetUserSessionsUseCase(inject(UserSessionRepository)),
    },
  ]);
}
