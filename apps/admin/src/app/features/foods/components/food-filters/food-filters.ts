import { Component, computed, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';
import { debounceTime } from 'rxjs';
import { FoodSource } from '../../models/food-attributes';
import { DEFAULT_FOOD_FILTER, FoodFilter } from '../../models/food-filter';
import {
  FOOD_ACTIVITY_OPTIONS,
  FOOD_SOURCE_OPTIONS,
  FOOD_VERIFICATION_OPTIONS,
} from '../../models/food-labels';
import { Translator } from '@core/i18n/translator';
import { TranslatePipe } from '@core/i18n/translate.pipe';

const SEARCH_DEBOUNCE_MS = 400;

@Component({
  selector: 'app-food-filters',
  imports: [ReactiveFormsModule, Button, InputText, Select, TranslatePipe],
  templateUrl: './food-filters.html',
  host: { class: 'flex min-w-0 flex-1' },
})
export class FoodFilters {
  private readonly translator = inject(Translator);
  readonly filterChange = output<FoodFilter>();

  protected readonly sourceOptions = computed(() => this.translator.options(FOOD_SOURCE_OPTIONS));
  protected readonly activityOptions = computed(() =>
    this.translator.options(FOOD_ACTIVITY_OPTIONS),
  );
  protected readonly verificationOptions = computed(() =>
    this.translator.options(FOOD_VERIFICATION_OPTIONS),
  );

  protected readonly form = inject(NonNullableFormBuilder).group({
    search: [''],
    source: [null as FoodSource | null],
    isActive: [DEFAULT_FOOD_FILTER.isActive],
    isVerified: [null as boolean | null],
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed())
      .subscribe(() => this.filterChange.emit(this.toFilter()));
  }

  protected reset(): void {
    this.form.reset();
  }

  private toFilter(): FoodFilter {
    const value = this.form.getRawValue();
    const search = value.search.trim();
    return {
      isActive: value.isActive,
      ...(search.length === 0 ? {} : { search }),
      ...(value.source === null ? {} : { source: value.source }),
      ...(value.isVerified === null ? {} : { isVerified: value.isVerified }),
    };
  }
}
