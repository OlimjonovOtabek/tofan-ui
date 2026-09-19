import { Account } from '../models/account';
import { UserResponse } from './account.dto';

export function toAccount(response: UserResponse): Account {
  return new Account(
    response.id,
    response.userName,
    emptyToNull(response.email),
    response.emailVerified,
    emptyToNull(response.phoneNumber),
    response.isActive,
    new Date(response.registeredOnUtc),
  );
}

function emptyToNull(value: string | null | undefined): string | null {
  return value === undefined || value === null || value.length === 0 ? null : value;
}
