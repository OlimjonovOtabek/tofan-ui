/**
 * Domain values are the camelCase spelling of the backend enum members (`fullBody` -> `FullBody`),
 * so the member name is the mapping: no order or integer value is hard-coded on this side.
 * A missing member means the contract moved, so it throws instead of guessing.
 */
export interface EnumMap<TDomain extends string, TApi extends number> {
  toApi(value: TDomain): TApi;
  toDomain(value: TApi): TDomain;
}

export function enumMap<TDomain extends string, TApi extends number>(
  apiEnum: Record<string, unknown>,
): EnumMap<TDomain, TApi> {
  return {
    toApi: (value) => {
      const member = apiEnum[capitalize(value)];
      if (typeof member !== 'number') {
        throw new Error(`The API enum has no member for '${value}'. Regenerate the API client.`);
      }
      return member as TApi;
    },
    toDomain: (value) => {
      const name = apiEnum[value];
      if (typeof name !== 'string') {
        throw new Error(`The API returned the unknown enum value ${value}.`);
      }
      return uncapitalize(name) as TDomain;
    },
  };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function uncapitalize(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}
