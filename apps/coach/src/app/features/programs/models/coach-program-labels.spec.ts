import { matchesProgramFilter, mealRangeLabel } from './coach-program-labels';

describe('coach program labels', () => {
  it('should join the formatted start and end dates', () => {
    const label = mealRangeLabel({ startDate: '2026-10-01', endDate: '2026-10-07' }, (date) => String(date.getDate()));

    expect(label).toBe('1 – 7');
  });

  it('should match a program when the title contains the search in any case', () => {
    expect(matchesProgramFilter('Strength Base', false, 'strength', 'all')).toBe(true);
    expect(matchesProgramFilter('Strength Base', false, 'cardio', 'all')).toBe(false);
  });

  it('should match only programs with the chosen publication status', () => {
    expect(matchesProgramFilter('Plan', true, '', 'published')).toBe(true);
    expect(matchesProgramFilter('Plan', true, '', 'draft')).toBe(false);
    expect(matchesProgramFilter('Plan', false, '', 'draft')).toBe(true);
  });
});
