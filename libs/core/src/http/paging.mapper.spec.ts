import { toPage, toPagedQuery } from './paging.mapper';

describe('toPagedQuery', () => {
  it('should send only the row window when nothing is sorted', () => {
    expect(toPagedQuery({ first: 25, rows: 25 })).toEqual({ First: 25, Rows: 25 });
  });

  it('should translate the sort direction when a column is sorted', () => {
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

  it('should use the snake_case column name when sorting', () => {
    const sortBy = (sortField: string) =>
      toPagedQuery({ first: 0, rows: 10, sortField, sortDirection: 'asc' }).SortField;

    expect(sortBy('nameUz')).toBe('name_uz');
    expect(sortBy('caloriesPerServing')).toBe('calories_per_serving');
    expect(sortBy('updatedOnUtc')).toBe('updated_on_utc');
    expect(sortBy('type')).toBe('type');
  });
});

describe('toPage', () => {
  it('should map every item and keep the total when a page arrives', () => {
    const page = toPage({ data: [{ id: '1' }, { id: '2' }], totalCount: 7 }, (dto) => dto.id);

    expect(page).toEqual({ items: ['1', '2'], totalCount: 7 });
  });

  it('should return an empty page when the answer is empty', () => {
    expect(toPage({}, (dto: { id: string }) => dto.id)).toEqual({ items: [], totalCount: 0 });
  });
});
