import { shortId } from '@shared/utils/identifiers';

export interface PersonName {
  readonly primary: string;
  readonly secondary: string | null;
  readonly isIdFallback: boolean;
}

export function toPersonName(
  fullName: string | null,
  userName: string | null,
  id: string,
): PersonName {
  const name = fullName?.trim() || null;
  const login = userName?.trim() || null;
  if (name !== null) {
    return { primary: name, secondary: login, isIdFallback: false };
  }
  if (login !== null) {
    return { primary: login, secondary: null, isIdFallback: false };
  }
  return { primary: shortId(id), secondary: null, isIdFallback: true };
}
