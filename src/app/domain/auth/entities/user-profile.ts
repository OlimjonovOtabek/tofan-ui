export class UserProfile {
  constructor(
    readonly id: string,
    readonly username: string,
    readonly fullName: string,
    readonly roles: readonly string[],
  ) {}

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }
}
