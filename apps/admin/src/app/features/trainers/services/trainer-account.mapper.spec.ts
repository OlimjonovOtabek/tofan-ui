import { TrainerAccountResponse } from './trainer-account.dto';
import { toTrainerAccount } from './trainer-account.mapper';

const response: TrainerAccountResponse = {
  id: 'u1',
  userName: 'jasur',
  email: 'jasur@example.com',
  emailVerified: false,
  phoneNumber: '+998901234567',
  isActive: true,
  registeredOnUtc: '2026-10-02T09:00:00Z',
};

describe('toTrainerAccount', () => {
  it('should keep the username, email and phone when the account has them', () => {
    expect(toTrainerAccount(response)).toEqual({
      username: 'jasur',
      email: 'jasur@example.com',
      phoneNumber: '+998901234567',
    });
  });

  it('should fall back to an empty email and no phone when Keycloak has neither', () => {
    expect(toTrainerAccount({ ...response, email: null, phoneNumber: null })).toEqual({
      username: 'jasur',
      email: '',
      phoneNumber: null,
    });
  });
});
