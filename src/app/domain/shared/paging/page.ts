export type SortDirection = 'asc' | 'desc';

/** One page of a server-side list: the backend pages by row offset, not by page number. */
export interface PageRequest {
  readonly first: number;
  readonly rows: number;
  readonly sortField?: string;
  readonly sortDirection?: SortDirection;
}

export interface Page<TItem> {
  readonly items: readonly TItem[];
  readonly totalCount: number;
}

export const DEFAULT_PAGE_SIZE = 25;

export function firstPage(rows: number = DEFAULT_PAGE_SIZE): PageRequest {
  return { first: 0, rows };
}

export function emptyPage<TItem>(): Page<TItem> {
  return { items: [], totalCount: 0 };
}
