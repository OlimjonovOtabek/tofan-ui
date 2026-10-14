export function mealRangeLabel(
  range: { startDate: string; endDate: string },
  formatDate: (date: Date) => string,
): string {
  return `${formatDate(new Date(range.startDate))} – ${formatDate(new Date(range.endDate))}`;
}

export type ProgramStatusFilter = 'all' | 'published' | 'draft';

export function matchesProgramFilter(
  title: string,
  isPublished: boolean,
  search: string,
  status: ProgramStatusFilter,
): boolean {
  const matchesStatus = status === 'all' || (status === 'published') === isPublished;
  return matchesStatus && title.toLocaleLowerCase().includes(search.toLocaleLowerCase());
}
