import {
  daysBetween,
  formatCount,
  formatDayMonth,
  formatDayMonthLong,
  formatDayMonthTime,
  formatDecimal,
  formatMoney,
  formatMoneyShort,
  formatWeekdayShort,
} from './formats';

const NBSP = ' ';
const october22 = new Date(2026, 9, 22, 9, 5);

describe('formatCount', () => {
  it('should group thousands with a space and round when the locale is Uzbek', () => {
    expect(formatCount(1234567.6, 'uz')).toBe(`1${NBSP}234${NBSP}568`);
  });

  it('should use the English grouping when the locale is English', () => {
    expect(formatCount(1234567, 'en')).toBe('1,234,567');
  });
});

describe('formatDecimal', () => {
  it('should use a comma decimal separator when the locale is Uzbek', () => {
    expect(formatDecimal(72.5, 'uz', 1)).toBe('72,5');
  });
});

describe('formatMoney', () => {
  it('should put the currency after the amount when the locale is Uzbek', () => {
    expect(formatMoney(450000, 'UZS', 'uz')).toBe(`450${NBSP}000${NBSP}UZS`);
  });

  it('should put the currency before the amount when the locale is English', () => {
    expect(formatMoney(450000, 'UZS', 'en')).toBe(`UZS${NBSP}450,000`);
  });

  it('should show only the number when the currency is unknown', () => {
    expect(formatMoney(null, null, 'en')).toBe('0');
  });
});

describe('formatMoneyShort', () => {
  it('should shorten large amounts with a suffix when the amount is in millions', () => {
    expect(formatMoneyShort(1_250_000, 'en')).toBe('1.3m');
    expect(formatMoneyShort(450_000, 'uz')).toBe('450k');
    expect(formatMoneyShort(900, 'en')).toBe('900');
  });
});

describe('formatDayMonth', () => {
  it('should use Uzbek short month names when the locale is Uzbek', () => {
    expect(formatDayMonth(october22, 'uz')).toBe('22 okt');
  });

  it('should use the browser month names when the locale is English', () => {
    expect(formatDayMonth(october22, 'en')).toBe('22 Oct');
  });
});

describe('formatDayMonthLong', () => {
  it('should add the year only when asked', () => {
    expect(formatDayMonthLong(october22, 'uz', false)).toBe('22 oktabr');
    expect(formatDayMonthLong(october22, 'uz', true)).toBe('22 oktabr 2026');
  });
});

describe('formatDayMonthTime', () => {
  it('should append a zero padded time when a moment is formatted', () => {
    expect(formatDayMonthTime(october22, 'uz')).toBe('22 okt, 09:05');
  });
});

describe('formatWeekdayShort', () => {
  it('should use Uzbek weekday names when the locale is Uzbek', () => {
    expect(formatWeekdayShort(october22, 'uz')).toBe('Pay');
  });
});

describe('daysBetween', () => {
  it('should count calendar days when the times of day differ', () => {
    expect(daysBetween(new Date(2026, 9, 20, 23, 0), new Date(2026, 9, 22, 1, 0))).toBe(2);
  });
});
