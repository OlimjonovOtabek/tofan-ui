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

/**
 * The sort field is a response property name (`nameUz`). The backend matches it against the
 * snake_case columns of that response (`name_uz`) and silently sorts by `id` when nothing matches,
 * so a camelCase name would look accepted and never sort.
 */
export function toPagedQuery(request: PageRequest): PagedQuery {
  return {
    First: request.first,
    Rows: request.rows,
    ...(request.sortField === undefined
      ? {}
      : {
          SortField: toSnakeCase(request.sortField),
          SortOrder: request.sortDirection === 'desc' ? DESCENDING : ASCENDING,
        }),
  };
}

function toSnakeCase(field: string): string {
  return field.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
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
