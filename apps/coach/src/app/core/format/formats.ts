import { AppLocale, INTL_LOCALES } from '@core/i18n/locale';

const UZ_MONTHS_SHORT = [
  'yan',
  'fev',
  'mar',
  'apr',
  'may',
  'iyn',
  'iyl',
  'avg',
  'sen',
  'okt',
  'noy',
  'dek',
];
const UZ_MONTHS_LONG = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];
const UZ_WEEKDAYS_SHORT = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
const UZ_GROUP = ' ';
const UZ_DECIMAL = ',';
const NBSP = ' ';
const SHORT_SUFFIXES = ['', 'k', 'm', 'b', 't'];
const THOUSAND = 1000;

export function formatCount(value: number, locale: AppLocale): string {
  return formatDecimal(Math.round(value), locale, 0);
}

export function formatDecimal(
  value: number,
  locale: AppLocale,
  maxFractionDigits: number,
  minFractionDigits = 0,
): string {
  const options = {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: minFractionDigits,
  };
  if (locale !== 'uz') {
    return new Intl.NumberFormat(INTL_LOCALES[locale], options).format(value);
  }
  const parts = new Intl.NumberFormat('en-US', options).formatToParts(value);
  return parts
    .map((part) =>
      part.type === 'group' ? UZ_GROUP : part.type === 'decimal' ? UZ_DECIMAL : part.value,
    )
    .join('');
}

export function formatMoney(
  amount: number | null,
  currencyCode: string | null,
  locale: AppLocale,
): string {
  const value = formatCount(amount ?? 0, locale);
  if (currencyCode === null || currencyCode === '') {
    return value;
  }
  return locale === 'en' ? `${currencyCode}${NBSP}${value}` : `${value}${NBSP}${currencyCode}`;
}

export function formatMoneyShort(amount: number | null, locale: AppLocale): string {
  const value = amount ?? 0;
  const sign = value < 0 ? '-' : '';
  let rest = Math.abs(value);
  let tier = 0;
  while (rest >= THOUSAND && tier < SHORT_SUFFIXES.length - 1) {
    rest /= THOUSAND;
    tier++;
  }
  return `${sign}${formatDecimal(rest, locale, tier === 0 ? 0 : 1)}${SHORT_SUFFIXES[tier]}`;
}

export function formatDayMonth(date: Date, locale: AppLocale): string {
  if (locale === 'uz') {
    return `${date.getDate()} ${UZ_MONTHS_SHORT[date.getMonth()]}`;
  }
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], { day: 'numeric', month: 'short' }).format(
    date,
  );
}

export function formatDayMonthLong(date: Date, locale: AppLocale, withYear: boolean): string {
  if (locale === 'uz') {
    const text = `${date.getDate()} ${UZ_MONTHS_LONG[date.getMonth()]}`;
    return withYear ? `${text} ${date.getFullYear()}` : text;
  }
  const options: Intl.DateTimeFormatOptions = withYear
    ? { day: 'numeric', month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'long' };
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], options).format(date);
}

export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDayMonthTime(date: Date, locale: AppLocale): string {
  return `${formatDayMonth(date, locale)}, ${formatTime(date)}`;
}

export function formatWeekdayShort(date: Date, locale: AppLocale): string {
  if (locale === 'uz') {
    return UZ_WEEKDAYS_SHORT[date.getDay()];
  }
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], { weekday: 'short' }).format(date);
}

export function daysBetween(earlier: Date, later: Date): number {
  const start = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
  const end = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate());
  return Math.round((end - start) / 86_400_000);
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
