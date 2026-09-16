import { Page, PageRequest } from '@shared/models/page';
import { Query } from './api.dto';

export interface PagedQuery extends Query {
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
          SortField: toSnakeCase(request.sortField),
          SortOrder: request.sortDirection === 'desc' ? DESCENDING : ASCENDING,
        }),
  };
}

function toSnakeCase(field: string): string {
  return field.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

export function toPage<TDto, TItem>(
  list: { data?: TDto[]; totalCount?: number },
  toItem: (dto: TDto) => TItem,
): Page<TItem> {
  return {
    items: (list.data ?? []).map(toItem),
    totalCount: list.totalCount ?? 0,
  };
}
