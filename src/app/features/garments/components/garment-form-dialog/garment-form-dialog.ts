import { Component, effect, input, model, output, signal, untracked } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { CreatedGarment } from '../../models/created-garment';
import { GarmentDraft, latestManufacturingDay } from '../../models/garment-draft';
import { GARMENT_SIZE_OPTIONS } from '../../models/garment-labels';
import { ChoiceField } from '@shared/components/choice-field/choice-field';
import { ColorField } from '@shared/components/color-field/color-field';
import { DateField } from '@shared/components/date-field/date-field';
import { FieldError } from '@shared/components/field-error/field-error';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { TextField } from '@shared/components/text-field/text-field';
import { GarmentCreatedPanel } from '../garment-created-panel/garment-created-panel';
import {
  GarmentFormValue,
  emptyGarmentFormValue,
  garmentFormSchema,
  toGarmentDraft,
} from './garment-form.schema';

@Component({
  selector: 'app-garment-form-dialog',
  imports: [
    FormField,
    FormDialog,
    FieldError,
    ChoiceField,
    ColorField,
    DateField,
    TextField,
    GarmentCreatedPanel,
    TranslatePipe,
  ],
  templateUrl: './garment-form-dialog.html',
})
export class GarmentFormDialog {
  readonly visible = model.required<boolean>();
  readonly saving = input(false);
  readonly created = input<CreatedGarment | null>(null);

  readonly save = output<GarmentDraft>();

  protected readonly sizeOptions = GARMENT_SIZE_OPTIONS;

  private readonly latestDay = signal(latestManufacturingDay(new Date()));
  protected readonly value = signal<GarmentFormValue>(emptyGarmentFormValue(this.latestDay()));
  protected readonly form = form(this.value, garmentFormSchema(this.latestDay));

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => this.prepare());
      }
    });
  }

  protected submit(): void {
    this.form().markAsTouched();
    const draft = toGarmentDraft(this.value());
    if (this.form().invalid() || draft === null) {
      return;
    }
    this.save.emit(draft);
  }

  private prepare(): void {
    this.latestDay.set(latestManufacturingDay(new Date()));
    this.form().reset(emptyGarmentFormValue(this.latestDay()));
  }
}
