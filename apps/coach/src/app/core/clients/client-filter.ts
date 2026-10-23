export const CLIENT_FILTERS = ['all', 'active', 'expiring', 'lowActivity', 'ended'] as const;

export type ClientFilter = (typeof CLIENT_FILTERS)[number];

export const DEFAULT_CLIENT_FILTER: ClientFilter = 'active';
export const CLIENT_FILTER_PARAM = 'filter';

export function toClientFilter(value: unknown): ClientFilter {
  return CLIENT_FILTERS.find((filter) => filter === value) ?? DEFAULT_CLIENT_FILTER;
}
