export class Account {
  constructor(
    readonly id: string,
    readonly userName: string,
    readonly email: string | null,
    readonly emailVerified: boolean,
    readonly phoneNumber: string | null,
    readonly isActive: boolean,
    readonly registeredAt: Date,
  ) {}

  isBlocked(): boolean {
    return !this.isActive;
  }
}
