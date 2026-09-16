import { toUserSession } from './user-session.mapper';

const response = {
  id: '1',
  userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  accessTokenHash: 'A1B2C3',
  createdOnUtc: '2026-09-01T09:00:00Z',
  expiresOnUtc: '2026-11-30T09:00:00Z',
  isRevoked: false,
  revokedOnUtc: null,
};

describe('user session mapper', () => {
  it('should map the record without the token hash when a response arrives', () => {
    const session = toUserSession(response);

    expect(session.loggedInAt.toISOString()).toBe('2026-09-01T09:00:00.000Z');
    expect(session.expiresAt.toISOString()).toBe('2026-11-30T09:00:00.000Z');
    expect(session.revokedAt).toBeNull();
    expect(Object.values(session)).not.toContain('A1B2C3');
  });

  it('should keep the revocation time when the session was revoked', () => {
    const session = toUserSession({
      ...response,
      isRevoked: true,
      revokedOnUtc: '2026-09-02T10:00:00Z',
    });

    expect(session.revokedAt?.toISOString()).toBe('2026-09-02T10:00:00.000Z');
    expect(session.status(new Date('2026-09-03T00:00:00Z'))).toBe('revokedEverywhere');
  });
});
