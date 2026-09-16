/**
 * How a login record stands. There is deliberately no "active": a plain logout ends the session
 * in Keycloak without touching this record, so an unexpired record may belong to a closed session.
 */
export type UserSessionStatus = 'unexpired' | 'expired' | 'revokedEverywhere';

/**
 * One login of a user, written by the backend when the credentials were accepted. Token refreshes
 * add no record, and only "log out of every device" marks records as revoked.
 */
export class UserSession {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly loggedInAt: Date,
    /** Expiry of the access token issued at login; refreshed tokens are not tracked here. */
    readonly expiresAt: Date,
    readonly revokedAt: Date | null,
  ) {}

  status(now: Date = new Date()): UserSessionStatus {
    if (this.revokedAt !== null) {
      return 'revokedEverywhere';
    }
    return now.getTime() >= this.expiresAt.getTime() ? 'expired' : 'unexpired';
  }
}
