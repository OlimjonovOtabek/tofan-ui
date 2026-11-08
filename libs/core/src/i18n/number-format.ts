import { AppLocale, INTL_LOCALES } from './locale';

const DEFAULT_MAX_FRACTION_DIGITS = 3;
const UZ_SEPARATOR_SOURCE_LOCALE = 'en-US';
const UZ_GROUP = ' ';
const UZ_DECIMAL = ',';

export function formatNumber(
  value: number,
  locale: AppLocale,
  maxFractionDigits = DEFAULT_MAX_FRACTION_DIGITS,
  minFractionDigits = 0,
): string {
  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: minFractionDigits,
  };
  if (locale !== 'uz') {
    return new Intl.NumberFormat(INTL_LOCALES[locale], options).format(value);
  }
  return new Intl.NumberFormat(UZ_SEPARATOR_SOURCE_LOCALE, options)
    .formatToParts(value)
    .map(toUzbekPart)
    .join('');
}

function toUzbekPart(part: Intl.NumberFormatPart): string {
  if (part.type === 'group') {
    return UZ_GROUP;
  }
  return part.type === 'decimal' ? UZ_DECIMAL : part.value;
}
