export class AuthSession {
  constructor(
    readonly accessToken: string,
    readonly expiresAt: Date,
    readonly refreshToken: string | null = null,
  ) {}

  isExpired(now: Date = new Date()): boolean {
    return now.getTime() >= this.expiresAt.getTime();
  }
}
