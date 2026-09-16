import { Roles } from './roles';

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

  isAdmin(): boolean {
    return this.hasRole(Roles.admin);
  }
}
