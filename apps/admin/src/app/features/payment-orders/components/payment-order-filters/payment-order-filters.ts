import { Component, computed, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormField, form } from '@angular/forms/signals';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { SelectField } from '@shared/components/select-field/select-field';
import { isUuid } from '@shared/utils/identifiers';
import { debounceTime, distinctUntilChanged, filter, map, skip } from 'rxjs';
import { PaymentOrderStatus } from '../../models/payment-order';
import { PaymentOrderFilter } from '../../models/payment-order-filter';
import { PAYMENT_ORDER_STATUS_OPTIONS } from '../../models/payment-order-labels';

const SEARCH_DEBOUNCE_MS = 400;

interface PaymentOrderFilterValue {
  status: PaymentOrderStatus | null;
  userId: string;
  referenceId: string;
}

function emptyValue(): PaymentOrderFilterValue {
  return { status: null, userId: '', referenceId: '' };
}

@Component({
  selector: 'app-payment-order-filters',
  imports: [FormField, Button, InputText, SelectField, TranslatePipe],
  templateUrl: './payment-order-filters.html',
})
export class PaymentOrderFilters {
  private readonly translator = inject(Translator);

  readonly filterChange = output<PaymentOrderFilter>();

  protected readonly statusOptions = computed(() =>
    this.translator.options(PAYMENT_ORDER_STATUS_OPTIONS),
  );
  protected readonly value = signal<PaymentOrderFilterValue>(emptyValue());
  protected readonly form = form(this.value);
  protected readonly userIdInvalid = computed(() => isPartialId(this.value().userId));
  protected readonly referenceIdInvalid = computed(() => isPartialId(this.value().referenceId));

  constructor() {
    toObservable(this.value)
      .pipe(
        skip(1),
        debounceTime(SEARCH_DEBOUNCE_MS),
        filter((value) => !isPartialId(value.userId) && !isPartialId(value.referenceId)),
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

function isPartialId(text: string): boolean {
  const id = text.trim();
  return id.length > 0 && !isUuid(id);
}

function toFilter(value: PaymentOrderFilterValue): PaymentOrderFilter {
  const userId = value.userId.trim();
  const referenceId = value.referenceId.trim();
  return {
    ...(value.status === null ? {} : { status: value.status }),
    ...(isUuid(userId) ? { userId } : {}),
    ...(isUuid(referenceId) ? { referenceId } : {}),
  };
}
