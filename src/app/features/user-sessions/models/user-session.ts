export type UserSessionStatus = 'unexpired' | 'expired' | 'revokedEverywhere';

export class UserSession {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly loggedInAt: Date,
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
