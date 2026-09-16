const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Every backend record id (users included) is a UUID. */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
