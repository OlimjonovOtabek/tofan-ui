import { ValidationError } from '@shared/models/errors/validation.error';
import { Credentials } from './credentials';

describe('Credentials', () => {
  it('should trim the username when it has surrounding spaces', () => {
    const credentials = Credentials.create('  admin  ', 'secret');

    expect(credentials.username).toBe('admin');
    expect(credentials.password).toBe('secret');
  });

  it('should reject the credentials when the username is blank', () => {
    expect(() => Credentials.create('   ', 'secret')).toThrow(ValidationError);
  });

  it('should reject the credentials when the password is empty', () => {
    expect(() => Credentials.create('admin', '')).toThrow(ValidationError);
  });
});
