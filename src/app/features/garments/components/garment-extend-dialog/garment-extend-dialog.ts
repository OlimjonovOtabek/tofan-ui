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
import { FormField, form, max, min, required } from '@angular/forms/signals';
import { Garment } from '../../models/garment';
import { MAX_EXTENSION_MONTHS, MIN_EXTENSION_MONTHS } from '../../models/garment-extension';
import { formatDate } from '@core/i18n/date-format';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { FieldError } from '@shared/components/field-error/field-error';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { NumberField } from '@shared/components/number-field/number-field';

interface ExtendFormValue {
  months: number | null;
}

@Component({
  selector: 'app-garment-extend-dialog',
  imports: [FormField, FormDialog, FieldError, NumberField, TranslatePipe],
  templateUrl: './garment-extend-dialog.html',
})
export class GarmentExtendDialog {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly visible = model.required<boolean>();
  readonly garment = input<Garment | null>(null);
  readonly saving = input(false);

  readonly extend = output<number>();

  protected readonly header = computed(() =>
    this.translator.translate('garments.extend.header', {
      serial: this.garment()?.serialNumber ?? '',
    }),
  );
  protected readonly value = signal<ExtendFormValue>({ months: MIN_EXTENSION_MONTHS });
  protected readonly form = form(this.value, (path) => {
    required(path.months, { message: 'garments.extend.errors.required' });
    min(path.months, MIN_EXTENSION_MONTHS, { message: 'garments.extend.errors.min' });
    max(path.months, MAX_EXTENSION_MONTHS, { message: 'garments.extend.errors.max' });
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => this.form().reset({ months: MIN_EXTENSION_MONTHS }));
      }
    });
  }

  protected expiresLabel(): string {
    const expiresAt = this.garment()?.expiresAt;
    return expiresAt === null || expiresAt === undefined
      ? '—'
      : formatDate(expiresAt, this.localeStore.locale());
  }

  protected submit(): void {
    this.form().markAsTouched();
    const months = this.value().months;
    if (this.form().invalid() || months === null) {
      return;
    }
    this.extend.emit(months);
  }
}
