import { toUserSession, toUserSessionQuery } from './user-session.mapper';

const response = {
  id: '1',
  userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  accessTokenHash: 'A1B2C3',
  createdOnUtc: '2026-09-01T09:00:00Z',
  expiresOnUtc: '2026-11-30T09:00:00Z',
  isRevoked: false,
  revokedOnUtc: null,
  userName: 'stage-admin',
  ipAddress: '195.158.8.218',
  userAgent: 'Dart/3.11 (dart:io)',
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

describe('user session details', () => {
  it('should keep the username, the address and the agent when a new session arrives', () => {
    const session = toUserSession(response);

    expect(session.userName).toBe('stage-admin');
    expect(session.ipAddress).toBe('195.158.8.218');
    expect(session.userAgent).toBe('Dart/3.11 (dart:io)');
  });

  it('should keep the details empty when an older session has none', () => {
    const session = toUserSession({
      ...response,
      userName: null,
      ipAddress: undefined,
      userAgent: null,
    });

    expect(session.userName).toBeNull();
    expect(session.ipAddress).toBeNull();
    expect(session.userAgent).toBeNull();
  });
});

describe('toUserSessionQuery', () => {
  it('should leave every filter out when none is set', () => {
    expect(toUserSessionQuery({})).toEqual({
      UserId: undefined,
      Search: undefined,
      Status: undefined,
      CreatedFrom: undefined,
      CreatedTo: undefined,
    });
  });

  it('should send the backend status numbers when a status is chosen', () => {
    expect(toUserSessionQuery({ status: 'active' })['Status']).toBe(1);
    expect(toUserSessionQuery({ status: 'revoked' })['Status']).toBe(2);
    expect(toUserSessionQuery({ status: 'expired' })['Status']).toBe(3);
  });

  it('should send the user, the search and the login period when they are set', () => {
    expect(
      toUserSessionQuery({
        userId: 'u1',
        search: 'stage',
        loggedInFrom: new Date('2026-11-01T00:00:00.000Z'),
        loggedInBefore: new Date('2026-11-02T00:00:00.000Z'),
      }),
    ).toMatchObject({
      UserId: 'u1',
      Search: 'stage',
      CreatedFrom: '2026-11-01T00:00:00.000Z',
      CreatedTo: '2026-11-02T00:00:00.000Z',
    });
  });
});
