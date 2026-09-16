export class AuthSession {
  constructor(
    readonly accessToken: string,
    readonly expiresAt: Date,
    readonly refreshToken: string | null = null,
    readonly refreshExpiresAt: Date | null = null,
  ) {}

  isExpired(now: Date = new Date()): boolean {
    return now.getTime() >= this.expiresAt.getTime();
  }

  /** True while the refresh token can still buy a new access token. */
  canBeRenewed(now: Date = new Date()): boolean {
    if (this.refreshToken === null) {
      return false;
    }
    return this.refreshExpiresAt === null || now.getTime() < this.refreshExpiresAt.getTime();
  }

  /** A session is usable while it holds a valid access token or can renew it. */
  isUsable(now: Date = new Date()): boolean {
    return !this.isExpired(now) || this.canBeRenewed(now);
  }
}
