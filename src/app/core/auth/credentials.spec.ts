import { ValidationError } from '@shared/models/errors/validation.error';
import { Credentials } from './credentials';

describe('Credentials', () => {
  it('trims the username', () => {
    const credentials = Credentials.create('  admin  ', 'secret');

    expect(credentials.username).toBe('admin');
    expect(credentials.password).toBe('secret');
  });

  it('rejects a blank username', () => {
    expect(() => Credentials.create('   ', 'secret')).toThrow(ValidationError);
  });

  it('rejects an empty password', () => {
    expect(() => Credentials.create('admin', '')).toThrow(ValidationError);
  });
});
