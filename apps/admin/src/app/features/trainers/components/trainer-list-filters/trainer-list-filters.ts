import { Component, computed, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormField, form } from '@angular/forms/signals';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { SelectField } from '@shared/components/select-field/select-field';
import { debounceTime, distinctUntilChanged, map, skip } from 'rxjs';
import { TrainerPublishState } from '../../models/trainer';
import { TRAINER_PUBLISH_OPTIONS } from '../../models/trainer-labels';
import { TrainerListFilter } from '../../models/trainer-list-filter';

const SEARCH_DEBOUNCE_MS = 400;

interface TrainerListFilterValue {
  search: string;
  publishState: TrainerPublishState | null;
}

function emptyValue(): TrainerListFilterValue {
  return { search: '', publishState: null };
}

@Component({
  selector: 'app-trainer-list-filters',
  imports: [FormField, Button, InputText, SelectField, TranslatePipe],
  templateUrl: './trainer-list-filters.html',
})
export class TrainerListFilters {
  private readonly translator = inject(Translator);

  readonly filterChange = output<TrainerListFilter>();

  protected readonly publishOptions = computed(() =>
    this.translator.options(TRAINER_PUBLISH_OPTIONS),
  );
  protected readonly value = signal<TrainerListFilterValue>(emptyValue());
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
      .subscribe((trainerFilter) => this.filterChange.emit(trainerFilter));
  }

  protected reset(): void {
    this.form().reset(emptyValue());
  }
}

function toFilter(value: TrainerListFilterValue): TrainerListFilter {
  const search = value.search.trim();
  return {
    ...(search.length === 0 ? {} : { search }),
    ...(value.publishState === null ? {} : { publishState: value.publishState }),
  };
}
