import { Roles } from '../roles';

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

  /** Only admins may use the panel; every admin endpoint requires this realm role. */
  isAdmin(): boolean {
    return this.hasRole(Roles.admin);
  }
}
