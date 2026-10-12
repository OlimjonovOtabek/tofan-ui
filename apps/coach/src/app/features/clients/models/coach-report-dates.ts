import { TranslationKey } from '@core/i18n/dictionary';
import { mondayBasedWeekday } from './coach-adherence-days';

export type Translate = (key: TranslationKey) => string;

const MONTH_KEYS: readonly TranslationKey[] = [
  'coach.clients.months.jan',
  'coach.clients.months.feb',
  'coach.clients.months.mar',
  'coach.clients.months.apr',
  'coach.clients.months.may',
  'coach.clients.months.jun',
  'coach.clients.months.jul',
  'coach.clients.months.aug',
  'coach.clients.months.sep',
  'coach.clients.months.oct',
  'coach.clients.months.nov',
  'coach.clients.months.dec',
];
const WEEKDAY_KEYS: readonly TranslationKey[] = [
  'coach.programs.weekdays.monday',
  'coach.programs.weekdays.tuesday',
  'coach.programs.weekdays.wednesday',
  'coach.programs.weekdays.thursday',
  'coach.programs.weekdays.friday',
  'coach.programs.weekdays.saturday',
  'coach.programs.weekdays.sunday',
];
const ISO_DATE_LENGTH = 10;
const SHORT_WEEKDAY_LENGTH = 2;

interface DateParts {
  year: number;
  month: number;
  day: number;
}

function partsOf(isoDate: string): DateParts {
  const [year, month, day] = isoDate.slice(0, ISO_DATE_LENGTH).split('-').map(Number);
  return { year, month, day };
}

export function dayMonthLabel(isoDate: string, translate: Translate): string {
  const { month, day } = partsOf(isoDate);
  return `${day} ${translate(MONTH_KEYS[month - 1])}`;
}

export function fullDateLabel(isoDate: string, translate: Translate): string {
  return `${dayMonthLabel(isoDate, translate)}, ${partsOf(isoDate).year}`;
}

export function weekdayLabel(isoDate: string, translate: Translate): string {
  return translate(WEEKDAY_KEYS[mondayBasedWeekday(isoDate.slice(0, ISO_DATE_LENGTH))]);
}

export function shortWeekdayNames(translate: Translate): string[] {
  return WEEKDAY_KEYS.map((key) => translate(key).slice(0, SHORT_WEEKDAY_LENGTH));
}

export function rangeLabel(from: string, to: string, translate: Translate): string {
  return `${dayMonthLabel(from, translate)} – ${fullDateLabel(to, translate)}`;
}
