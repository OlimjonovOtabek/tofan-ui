import { Component, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormField, disabled, form } from '@angular/forms/signals';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { DateRangeField } from '@shared/components/date-range-field/date-range-field';
import { SelectField } from '@shared/components/select-field/select-field';
import { SelectOption } from '@shared/models/select-option';
import { DayRange, toDayPeriod } from '@shared/utils/day-range';
import { debounceTime, distinctUntilChanged, map, skip } from 'rxjs';
import { PaymentOrderStatus, PaymentProvider, PaymentPurpose } from '../../models/payment-order';
import { PaymentOrderFilter } from '../../models/payment-order-filter';
import {
  PAYMENT_ORDER_STATUS_OPTIONS,
  PAYMENT_PROVIDER_OPTIONS,
  PAYMENT_PURPOSE_OPTIONS,
} from '../../models/payment-order-labels';
import { TrainerOption } from '../../models/trainer-option';

const SEARCH_DEBOUNCE_MS = 400;

interface PaymentOrderFilterValue {
  search: string;
  status: PaymentOrderStatus | null;
  purpose: PaymentPurpose | null;
  paidWith: PaymentProvider | null;
  trainerId: string | null;
  created: DayRange;
}

function emptyValue(): PaymentOrderFilterValue {
  return {
    search: '',
    status: null,
    purpose: null,
    paidWith: null,
    trainerId: null,
    created: null,
  };
}

@Component({
  selector: 'app-payment-order-filters',
  imports: [FormField, Button, DateRangeField, InputText, SelectField, TranslatePipe],
  templateUrl: './payment-order-filters.html',
})
export class PaymentOrderFilters {
  private readonly translator = inject(Translator);

  readonly trainers = input<readonly TrainerOption[]>([]);
  readonly filterChange = output<PaymentOrderFilter>();

  protected readonly statusOptions = computed(() =>
    this.translator.options(PAYMENT_ORDER_STATUS_OPTIONS),
  );
  protected readonly purposeOptions = computed(() =>
    this.translator.options(PAYMENT_PURPOSE_OPTIONS),
  );
  protected readonly providerOptions = computed(() =>
    this.translator.options(PAYMENT_PROVIDER_OPTIONS),
  );
  protected readonly trainerOptions = computed<SelectOption<string>[]>(() =>
    this.trainers().map((trainer) => ({ value: trainer.id, label: trainer.displayName })),
  );
  protected readonly today = new Date();
  protected readonly value = signal<PaymentOrderFilterValue>(emptyValue());
  protected readonly form = form(this.value, (path) => {
    disabled(path.purpose, { when: ({ valueOf }) => valueOf(path.trainerId) !== null });
  });

  constructor() {
    toObservable(this.value)
      .pipe(
        skip(1),
        debounceTime(SEARCH_DEBOUNCE_MS),
        map(toFilter),
        distinctUntilChanged((previous, next) => JSON.stringify(previous) === JSON.stringify(next)),
        takeUntilDestroyed(),
      )
      .subscribe((paymentOrderFilter) => this.filterChange.emit(paymentOrderFilter));
  }

  protected reset(): void {
    this.form().reset(emptyValue());
  }
}

function toFilter(value: PaymentOrderFilterValue): PaymentOrderFilter {
  const search = value.search.trim();
  const period = toDayPeriod(value.created);
  return {
    ...(search.length === 0 ? {} : { search }),
    ...(value.status === null ? {} : { status: value.status }),
    ...(value.purpose === null ? {} : { purpose: value.purpose }),
    ...(value.paidWith === null ? {} : { paidWith: value.paidWith }),
    ...(value.trainerId === null ? {} : { trainerId: value.trainerId }),
    ...(period.from === undefined ? {} : { createdFrom: period.from }),
    ...(period.before === undefined ? {} : { createdBefore: period.before }),
  };
}
