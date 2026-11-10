import { Component, computed, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormField, form } from '@angular/forms/signals';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { DateRangeField } from '@shared/components/date-range-field/date-range-field';
import { SelectField } from '@shared/components/select-field/select-field';
import { DayRange, toDayPeriod } from '@shared/utils/day-range';
import { debounceTime, distinctUntilChanged, map, skip } from 'rxjs';
import { SessionListFilter, SessionStatusFilter } from '../../models/user-session-filter';
import { SESSION_STATUS_FILTER_OPTIONS } from '../../models/user-session-labels';

const SEARCH_DEBOUNCE_MS = 400;

interface SessionFilterValue {
  search: string;
  status: SessionStatusFilter | null;
  loggedIn: DayRange;
}

function emptyValue(): SessionFilterValue {
  return { search: '', status: null, loggedIn: null };
}

@Component({
  selector: 'app-user-session-filters',
  imports: [FormField, Button, DateRangeField, InputText, SelectField, TranslatePipe],
  templateUrl: './user-session-filters.html',
})
export class UserSessionFilters {
  private readonly translator = inject(Translator);

  readonly filterChange = output<SessionListFilter>();

  protected readonly statusOptions = computed(() =>
    this.translator.options(SESSION_STATUS_FILTER_OPTIONS),
  );
  protected readonly today = new Date();
  protected readonly value = signal<SessionFilterValue>(emptyValue());
  protected readonly form = form(this.value);

  constructor() {
    toObservable(this.value)
      .pipe(
        skip(1),
        debounceTime(SEARCH_DEBOUNCE_MS),
        map(toFilter),
        distinctUntilChanged((previous, next) => JSON.stringify(previous) === JSON.stringify(next)),
        takeUntilDestroyed(),
      )
      .subscribe((sessionFilter) => this.filterChange.emit(sessionFilter));
  }

  protected reset(): void {
    this.form().reset(emptyValue());
  }
}

function toFilter(value: SessionFilterValue): SessionListFilter {
  const search = value.search.trim();
  const period = toDayPeriod(value.loggedIn);
  return {
    ...(search.length === 0 ? {} : { search }),
    ...(value.status === null ? {} : { status: value.status }),
    ...(period.from === undefined ? {} : { loggedInFrom: period.from }),
    ...(period.before === undefined ? {} : { loggedInBefore: period.before }),
  };
}
