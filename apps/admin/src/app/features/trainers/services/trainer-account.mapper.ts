import { TrainerAccount } from '../models/trainer-account';
import { TrainerAccountResponse } from './trainer-account.dto';

export function toTrainerAccount(response: TrainerAccountResponse): TrainerAccount {
  return {
    username: response.userName,
    email: response.email ?? '',
    phoneNumber: response.phoneNumber ?? null,
  };
}
