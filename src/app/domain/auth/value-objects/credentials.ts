import { ValidationError } from '@domain/shared/errors/validation.error';

export class Credentials {
  private constructor(
    readonly username: string,
    readonly password: string,
  ) {}

  static create(username: string, password: string): Credentials {
    const normalizedUsername = username.trim();

    if (normalizedUsername.length === 0) {
      throw new ValidationError('Username is required.');
    }
    if (password.length === 0) {
      throw new ValidationError('Password is required.');
    }

    return new Credentials(normalizedUsername, password);
  }
}
