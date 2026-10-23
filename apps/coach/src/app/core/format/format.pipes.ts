import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import {
  formatCount,
  formatDayMonth,
  formatDayMonthTime,
  formatDecimal,
  formatMoney,
  formatMoneyShort,
} from './formats';

@Pipe({ name: 'count', pure: false })
export class CountPipe implements PipeTransform {
  private readonly locale = inject(LocaleStore).locale;

  transform(value: number | null): string {
    return formatCount(value ?? 0, this.locale());
  }
}

@Pipe({ name: 'decimal', pure: false })
export class DecimalPipe implements PipeTransform {
  private readonly locale = inject(LocaleStore).locale;

  transform(value: number, maxFractionDigits = 1, minFractionDigits = 0): string {
    return formatDecimal(value, this.locale(), maxFractionDigits, minFractionDigits);
  }
}

@Pipe({ name: 'money', pure: false })
export class MoneyPipe implements PipeTransform {
  private readonly locale = inject(LocaleStore).locale;

  transform(value: number | null, currencyCode: string | null): string {
    return formatMoney(value, currencyCode, this.locale());
  }
}

@Pipe({ name: 'moneyShort', pure: false })
export class MoneyShortPipe implements PipeTransform {
  private readonly locale = inject(LocaleStore).locale;

  transform(value: number | null): string {
    return formatMoneyShort(value, this.locale());
  }
}

@Pipe({ name: 'dayMonth', pure: false })
export class DayMonthPipe implements PipeTransform {
  private readonly locale = inject(LocaleStore).locale;

  transform(value: Date): string {
    return formatDayMonth(value, this.locale());
  }
}

@Pipe({ name: 'dayMonthTime', pure: false })
export class DayMonthTimePipe implements PipeTransform {
  private readonly locale = inject(LocaleStore).locale;

  transform(value: Date): string {
    return formatDayMonthTime(value, this.locale());
  }
}
