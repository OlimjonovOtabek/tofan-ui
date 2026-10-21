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
import { FormField, form, max, min, required, validate } from '@angular/forms/signals';
import { Message } from '@openng/optimus-ui/message';
import { TranslationKey } from '@core/i18n/dictionary';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { FieldError } from '@shared/components/field-error/field-error';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { NumberField } from '@shared/components/number-field/number-field';
import { Trainer } from '../../models/trainer';
import {
  COMMISSION_PERCENT_FRACTION_DIGITS,
  COMMISSION_PERCENT_MAX,
  COMMISSION_PERCENT_MIN,
  isValidCommissionPercent,
} from '../../models/trainer-commission';

const COMMISSION_ERROR: TranslationKey = 'trainers.commission.error';

interface TrainerCommissionFormValue {
  commissionPercent: number | null;
}

@Component({
  selector: 'app-trainer-commission-dialog',
  imports: [FormField, FormDialog, FieldError, NumberField, Message, TranslatePipe],
  templateUrl: './trainer-commission-dialog.html',
})
export class TrainerCommissionDialog {
  private readonly translator = inject(Translator);

  readonly visible = model.required<boolean>();
  readonly trainer = input<Trainer | null>(null);
  readonly saving = input(false);

  readonly save = output<number>();

  protected readonly fractionDigits = COMMISSION_PERCENT_FRACTION_DIGITS;
  protected readonly header = computed(() =>
    this.translator.translate('trainers.commission.header', {
      name: this.trainer()?.displayName ?? '',
    }),
  );
  protected readonly value = signal<TrainerCommissionFormValue>({ commissionPercent: null });
  protected readonly form = form(this.value, (path) => {
    required(path.commissionPercent, { message: COMMISSION_ERROR });
    min(path.commissionPercent, COMMISSION_PERCENT_MIN, { message: COMMISSION_ERROR });
    max(path.commissionPercent, COMMISSION_PERCENT_MAX, { message: COMMISSION_ERROR });
    validate(path.commissionPercent, ({ value }) => {
      const percent = value();
      return percent === null || isValidCommissionPercent(percent)
        ? null
        : { kind: 'commissionPercent', message: COMMISSION_ERROR };
    });
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const commissionPercent = this.trainer()?.commissionPercent ?? null;
        untracked(() => this.form().reset({ commissionPercent }));
      }
    });
  }

  protected submit(): void {
    this.form().markAsTouched();
    const percent = this.value().commissionPercent;
    if (this.form().invalid() || percent === null) {
      return;
    }
    this.save.emit(percent);
  }
}
