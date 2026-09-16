import { Page, PageRequest } from '@domain/shared/paging/page';

/** Query parameters every paged backend list accepts (`First`, `Rows`, `SortField`, `SortOrder`). */
export interface PagedQuery {
  First: number;
  Rows: number;
  SortField?: string;
  SortOrder?: number;
}

const ASCENDING = 1;
const DESCENDING = -1;

export function toPagedQuery(request: PageRequest): PagedQuery {
  return {
    First: request.first,
    Rows: request.rows,
    ...(request.sortField === undefined
      ? {}
      : {
          SortField: request.sortField,
          SortOrder: request.sortDirection === 'desc' ? DESCENDING : ASCENDING,
        }),
  };
}

/** Turns a backend `PagedList<TDto>` into a domain page of entities. */
export function toPage<TDto, TItem>(
  list: { data?: TDto[]; totalCount?: number },
  toItem: (dto: TDto) => TItem,
): Page<TItem> {
  return {
    items: (list.data ?? []).map(toItem),
    totalCount: list.totalCount ?? 0,
  };
}
