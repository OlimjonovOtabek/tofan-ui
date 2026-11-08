import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { TranslationKey } from '@core/i18n/dictionary';
import { INTL_LOCALES } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@openng/optimus-ui/button';
import { Message } from '@openng/optimus-ui/message';
import { FieldError } from '@shared/components/field-error/field-error';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { NumberField } from '@shared/components/number-field/number-field';
import { SelectField } from '@shared/components/select-field/select-field';
import { SoldierField } from '@shared/components/soldier-field/soldier-field';
import { SelectOption } from '@shared/models/select-option';
import { SoldierOption } from '@shared/models/soldier-option';
import { MIN_ORDER_PRICE, PaymentOrderDraft } from '../../models/payment-order-draft';
import { TrainerOption } from '../../models/trainer-option';
import { emptyCreateFormValue, paymentOrderCreateSchema } from './payment-order-create.schema';

@Component({
  selector: 'app-payment-order-create-dialog',
  imports: [
    Button,
    FormField,
    Message,
    FieldError,
    FormDialog,
    NumberField,
    SelectField,
    SoldierField,
    TranslatePipe,
  ],
  templateUrl: './payment-order-create-dialog.html',
})
export class PaymentOrderCreateDialog {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly visible = model.required<boolean>();
  readonly trainers = input<readonly TrainerOption[]>([]);
  readonly trainersFailed = input(false);
  readonly soldiers = input<readonly SoldierOption[]>([]);
  readonly soldiersFailed = input(false);
  readonly saving = input(false);

  readonly create = output<PaymentOrderDraft>();
  readonly soldierSearch = output<string>();

  protected readonly value = signal(emptyCreateFormValue());
  protected readonly form = form(this.value, paymentOrderCreateSchema);

  protected readonly trainerOptions = computed<readonly SelectOption<string>[]>(() =>
    this.trainers().map((trainer) => ({ value: trainer.id, label: trainer.displayName })),
  );
  protected readonly soldiersEmpty = computed<TranslationKey>(() =>
    this.soldiersFailed()
      ? 'paymentOrders.create.soldierFailed'
      : 'paymentOrders.create.soldierEmpty',
  );
  private readonly selectedTrainer = computed(
    () =>
      this.trainers().find(
        (trainer) =>
          trainer.id === this.value().trainerId && trainer.standardPrice >= MIN_ORDER_PRICE,
      ) ?? null,
  );
  protected readonly trainerPrice = computed(() => {
    const trainer = this.selectedTrainer();
    if (trainer === null) {
      return null;
    }
    const amount = new Intl.NumberFormat(INTL_LOCALES[this.localeStore.locale()]).format(
      trainer.standardPrice,
    );
    return this.translator.translate('paymentOrders.create.trainerPrice', { amount });
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => {
          this.form().reset(emptyCreateFormValue());
          this.soldierSearch.emit('');
        });
      }
    });
  }

  protected useTrainerPrice(): void {
    const trainer = this.selectedTrainer();
    if (trainer === null) {
      return;
    }
    this.value.update((value) => ({ ...value, price: trainer.standardPrice }));
  }

  protected submit(): void {
    this.form().markAsTouched();
    const { userId, trainerId, price } = this.value();
    if (this.form().invalid() || userId === null || trainerId === null || price === null) {
      return;
    }
    this.create.emit({ userId, trainerId, price });
  }
}
