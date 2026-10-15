import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { isTakenAccountValue, toTakenTrainerAccount } from './taken-trainer-account';
import { TrainerDraft } from './trainer-draft';

const draft: TrainerDraft = {
  username: 'jasur',
  email: 'jasur@example.com',
  phoneNumber: null,
  password: 'Passw0rd!23',
  displayName: 'Jasur',
  bio: null,
  photoFileId: null,
};

describe('toTakenTrainerAccount', () => {
  it('should point at the username when the backend says the username is taken', () => {
    const error = new ConflictError('taken', 'User.UsernameTaken');

    expect(toTakenTrainerAccount(error, draft)).toEqual({ field: 'username', value: 'jasur' });
  });

  it('should point at the email when the backend says the email is taken', () => {
    const error = new ConflictError('taken', 'User.EmailTaken');

    expect(toTakenTrainerAccount(error, draft)).toEqual({
      field: 'email',
      value: 'jasur@example.com',
    });
  });

  it('should ignore a conflict that is not about the account fields', () => {
    expect(
      toTakenTrainerAccount(new ConflictError('dup', 'Conflict.DuplicateKey'), draft),
    ).toBeNull();
  });

  it('should ignore an error that is not a conflict', () => {
    expect(
      toTakenTrainerAccount(new BusinessRuleError('x', 'User.UsernameTaken'), draft),
    ).toBeNull();
  });
});

describe('isTakenAccountValue', () => {
  const taken = { field: 'username', value: 'jasur' } as const;

  it('should match the taken value when only case and spaces differ', () => {
    expect(isTakenAccountValue(taken, 'username', ' JASUR ')).toBe(true);
  });

  it('should not match when the admin typed another value', () => {
    expect(isTakenAccountValue(taken, 'username', 'jasur2')).toBe(false);
  });

  it('should not match another field with the same text', () => {
    expect(isTakenAccountValue(taken, 'email', 'jasur')).toBe(false);
  });

  it('should not match anything when nothing is taken', () => {
    expect(isTakenAccountValue(null, 'username', 'jasur')).toBe(false);
  });
});
