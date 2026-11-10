import { Component, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormField, form } from '@angular/forms/signals';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { debounceTime, distinctUntilChanged, map, skip } from 'rxjs';
import { SubscriptionFilter } from '../../models/subscription-filter';
import {
  SUBSCRIPTION_STATUS_OPTIONS,
  SUBSCRIPTION_TIER_OPTIONS,
} from '../../models/trainer-labels';
import { SubscriptionStatus } from '../../models/subscription-status';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { SelectField } from '@shared/components/select-field/select-field';
import { ToggleField } from '@shared/components/toggle-field/toggle-field';
import { SelectOption } from '@shared/models/select-option';
import { Tier } from '@shared/models/tier';

const SEARCH_DEBOUNCE_MS = 400;

interface SubscriptionFilterValue {
  search: string;
  trainerId: string | null;
  status: SubscriptionStatus | null;
  tier: Tier | null;
  endingSoon: boolean;
}

function emptyValue(): SubscriptionFilterValue {
  return { search: '', trainerId: null, status: null, tier: null, endingSoon: false };
}

@Component({
  selector: 'app-subscription-filters',
  imports: [FormField, Button, InputText, SelectField, ToggleField, TranslatePipe],
  templateUrl: './subscription-filters.html',
})
export class SubscriptionFilters {
  private readonly translator = inject(Translator);

  readonly trainerOptions = input.required<readonly SelectOption<string>[]>();
  readonly filterChange = output<SubscriptionFilter>();

  protected readonly statusOptions = computed(() =>
    this.translator.options(SUBSCRIPTION_STATUS_OPTIONS),
  );
  protected readonly tierOptions = computed(() =>
    this.translator.options(SUBSCRIPTION_TIER_OPTIONS),
  );
  protected readonly value = signal<SubscriptionFilterValue>(emptyValue());
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
      .subscribe((subscriptionFilter) => this.filterChange.emit(subscriptionFilter));
  }

  protected reset(): void {
    this.form().reset(emptyValue());
  }
}

function toFilter(value: SubscriptionFilterValue): SubscriptionFilter {
  const search = value.search.trim();
  return {
    ...(search.length === 0 ? {} : { search }),
    ...(value.trainerId === null ? {} : { trainerId: value.trainerId }),
    ...(value.status === null ? {} : { status: value.status }),
    ...(value.tier === null ? {} : { tier: value.tier }),
    ...(value.endingSoon ? { endingSoon: true } : {}),
  };
}
