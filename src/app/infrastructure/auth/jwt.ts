/**
 * Reads the payload of a JWT without verifying it: the backend is the one that validates tokens,
 * the panel only needs the claims it already received from Keycloak.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const payload = token.split('.')[1];
  if (payload === undefined) {
    return null;
  }

  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const decoded: unknown = JSON.parse(decodeUtf8(json));
    return typeof decoded === 'object' && decoded !== null
      ? (decoded as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** `atob` yields one byte per character; claims with non-ASCII letters need decoding back to UTF-8. */
function decodeUtf8(binary: string): string {
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
