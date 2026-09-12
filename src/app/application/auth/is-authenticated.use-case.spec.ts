import { AuthSession } from '@domain/auth/entities/auth-session';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { IsAuthenticatedUseCase } from './is-authenticated.use-case';

describe('IsAuthenticatedUseCase', () => {
  const now = new Date('2026-01-01T12:00:00Z');

  function useCaseWith(session: AuthSession | null): IsAuthenticatedUseCase {
    const sessionRepository: SessionRepository = {
      get: () => session,
      save: vi.fn(),
      clear: vi.fn(),
    };
    return new IsAuthenticatedUseCase(sessionRepository);
  }

  it('is false without a session', () => {
    expect(useCaseWith(null).execute(now)).toBe(false);
  });

  it('is false for an expired session', () => {
    expect(
      useCaseWith(new AuthSession('token', new Date('2026-01-01T11:00:00Z'))).execute(now),
    ).toBe(false);
  });

  it('is true for a live session', () => {
    expect(
      useCaseWith(new AuthSession('token', new Date('2026-01-01T13:00:00Z'))).execute(now),
    ).toBe(true);
  });
});
