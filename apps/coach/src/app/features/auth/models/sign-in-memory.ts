export interface RememberedSignIn {
  readonly identifier: string;
  readonly remember: boolean;
}

export const FORGOTTEN_SIGN_IN: RememberedSignIn = { identifier: '', remember: false };

export function parseRememberedSignIn(raw: string | null): RememberedSignIn {
  if (raw === null) {
    return FORGOTTEN_SIGN_IN;
  }
  try {
    const value: unknown = JSON.parse(raw);
    return isRememberedSignIn(value) && value.remember ? value : FORGOTTEN_SIGN_IN;
  } catch {
    return FORGOTTEN_SIGN_IN;
  }
}

function isRememberedSignIn(value: unknown): value is RememberedSignIn {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return typeof candidate['identifier'] === 'string' && typeof candidate['remember'] === 'boolean';
}
