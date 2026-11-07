import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Button } from '@openng/optimus-ui/button';
import { Message } from '@openng/optimus-ui/message';
import { FieldError } from '@shared/components/field-error/field-error';
import { NumberField } from '@shared/components/number-field/number-field';
import { PlatformFee } from '../../models/platform-fee';
import { PlatformFeeDraft } from '../../models/platform-fee-draft';
import { PLATFORM_FEE_FRACTION_DIGITS } from '../../models/platform-fee-rules';
import {
  platformFeeFormSchema,
  toPlatformFeeDraft,
  toPlatformFeeFormValue,
} from './platform-fee.schema';

@Component({
  selector: 'app-platform-fee-form',
  imports: [FormField, FormRoot, FieldError, NumberField, Button, Message, TranslatePipe],
  templateUrl: './platform-fee-form.html',
})
export class PlatformFeeForm {
  readonly fee = input.required<PlatformFee>();
  readonly saving = input(false);

  readonly save = output<PlatformFeeDraft>();

  protected readonly fractionDigits = PLATFORM_FEE_FRACTION_DIGITS;
  protected readonly currencySuffix = computed(() => ` ${this.fee().currencyCode}`);
  protected readonly value = linkedSignal(() => toPlatformFeeFormValue(this.fee()));
  protected readonly form = form(this.value, platformFeeFormSchema, {
    submission: { action: () => this.submit() },
  });

  private async submit(): Promise<undefined> {
    const draft = toPlatformFeeDraft(this.value());
    if (draft !== null) {
      this.save.emit(draft);
    }
    return undefined;
  }
}
