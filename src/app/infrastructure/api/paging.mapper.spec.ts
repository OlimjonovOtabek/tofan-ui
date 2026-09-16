import { toPage, toPagedQuery } from './paging.mapper';

describe('toPagedQuery', () => {
  it('sends the row window alone when nothing is sorted', () => {
    expect(toPagedQuery({ first: 25, rows: 25 })).toEqual({ First: 25, Rows: 25 });
  });

  it('translates the sort direction the way the backend expects', () => {
    expect(toPagedQuery({ first: 0, rows: 10, sortField: 'name', sortDirection: 'asc' })).toEqual({
      First: 0,
      Rows: 10,
      SortField: 'name',
      SortOrder: 1,
    });
    expect(toPagedQuery({ first: 0, rows: 10, sortField: 'name', sortDirection: 'desc' })).toEqual({
      First: 0,
      Rows: 10,
      SortField: 'name',
      SortOrder: -1,
    });
  });
});

describe('toPage', () => {
  it('maps every item and keeps the total', () => {
    const page = toPage({ data: [{ id: '1' }, { id: '2' }], totalCount: 7 }, (dto) => dto.id);

    expect(page).toEqual({ items: ['1', '2'], totalCount: 7 });
  });

  it('survives an empty answer', () => {
    expect(toPage({}, (dto: { id: string }) => dto.id)).toEqual({ items: [], totalCount: 0 });
  });
});
