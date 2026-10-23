import { EARNINGS_PAGE_SIZE, hasMore, periodRange } from './earnings';
import { isFull } from './preview-video';
import {
  averageOf,
  isGeneratedSlug,
  isValidSlug,
  monthlyRevenue,
  publishedPrograms,
} from './profile-overview';

const profile = { monthlyPrice: 450000 } as never;

describe('profile overview rules', () => {
  it('should multiply the price by the clients and sum published programs', () => {
    const overview = {
      profile,
      clientCount: 4,
      averageAdherence: null,
      publishedWorkoutPrograms: 1,
      publishedMealPrograms: 2,
    };

    expect(monthlyRevenue(overview)).toBe(1800000);
    expect(publishedPrograms(overview)).toBe(3);
    expect(monthlyRevenue({ ...overview, clientCount: null })).toBeNull();
    expect(publishedPrograms({ ...overview, publishedMealPrograms: null })).toBeNull();
  });

  it('should average only the known adherence values', () => {
    expect(averageOf([80, null, 71])).toBe(76);
    expect(averageOf([null])).toBeNull();
  });
});

describe('slug rules', () => {
  it('should accept an empty slug and lowercase words joined by single dashes', () => {
    expect(['', 'aziz-fit', 'a1b'].map(isValidSlug)).toEqual([true, true, true]);
    expect(['ab', '-aziz', 'aziz-', 'a--b', 'Aziz', 'a'.repeat(31)].map(isValidSlug)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
  });

  it('should know the generated trainer slugs', () => {
    expect(['trainer', 'trainer-12', 'trainer-x', 'aziz'].map(isGeneratedSlug)).toEqual([
      true,
      true,
      false,
      false,
    ]);
  });
});

describe('earnings rules', () => {
  const today = new Date(2026, 9, 22);

  it('should give the month so far, the last month and the year so far', () => {
    expect(periodRange('thisMonth', today)).toEqual({
      from: new Date(2026, 9, 1),
      to: new Date(2026, 9, 22),
    });
    expect(periodRange('lastMonth', today)).toEqual({
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 30),
    });
    expect(periodRange('thisYear', today)).toEqual({
      from: new Date(2026, 0, 1),
      to: new Date(2026, 9, 22),
    });
  });

  it('should offer more when fewer payments than the total are shown', () => {
    const summary = {
      currencyCode: null,
      paymentCount: 0,
      netAmount: 0,
      refundCount: 0,
      refundedAmount: 0,
    };

    expect(
      hasMore({ period: 'thisMonth', summary, payments: [], totalCount: EARNINGS_PAGE_SIZE }),
    ).toBe(true);
    expect(hasMore({ period: 'thisMonth', summary, payments: [], totalCount: 0 })).toBe(false);
  });

  it('should stop previews at five videos', () => {
    expect(isFull(new Array(5).fill({}))).toBe(true);
    expect(isFull(new Array(4).fill({}))).toBe(false);
  });
});
