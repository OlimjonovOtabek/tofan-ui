import { Component, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { FieldError } from '@shared/components/field-error/field-error';
import { FileUpload } from '@shared/components/file-upload/file-upload';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { NumberField } from '@shared/components/number-field/number-field';
import { TextField } from '@shared/components/text-field/text-field';
import { TextareaField } from '@shared/components/textarea-field/textarea-field';
import { TakenTrainerAccount } from '../../models/taken-trainer-account';
import { Trainer } from '../../models/trainer';
import { TrainerAccount } from '../../models/trainer-account';
import { TrainerEditDraft } from '../../models/trainer-edit-draft';
import {
  TrainerEditFormValue,
  toTrainerEditDraft,
  toTrainerEditFormValue,
  trainerEditFormSchema,
} from './trainer-edit.schema';

const EMPTY_VALUE: TrainerEditFormValue = {
  email: '',
  phoneNumber: '',
  displayName: '',
  bio: '',
  monthlyPrice: 0,
};

@Component({
  selector: 'app-trainer-edit-dialog',
  imports: [
    FormField,
    FormDialog,
    FieldError,
    FileUpload,
    NumberField,
    TextField,
    TextareaField,
    TranslatePipe,
  ],
  templateUrl: './trainer-edit-dialog.html',
})
export class TrainerEditDialog {
  private readonly translator = inject(Translator);

  readonly visible = model.required<boolean>();
  readonly trainer = input<Trainer | null>(null);
  readonly account = input<TrainerAccount | null>(null);
  readonly saving = input(false);
  readonly takenAccount = input<TakenTrainerAccount | null>(null);

  readonly save = output<TrainerEditDraft>();

  protected readonly value = signal<TrainerEditFormValue>(EMPTY_VALUE);
  protected readonly form = form(this.value, trainerEditFormSchema(this.takenAccount));
  protected readonly photoFileId = signal<string | null>(null);
  protected readonly photoFileName = signal<string | null>(null);

  constructor() {
    effect(() => {
      const trainer = this.trainer();
      const account = this.account();
      if (this.visible() && trainer !== null && account !== null) {
        untracked(() => this.prepare(trainer, account));
      }
    });
  }

  protected submit(): void {
    this.form().markAsTouched();
    if (this.account() === null || this.form().invalid()) {
      return;
    }
    this.save.emit(toTrainerEditDraft(this.value(), this.photoFileId()));
  }

  private prepare(trainer: Trainer, account: TrainerAccount): void {
    this.form().reset(toTrainerEditFormValue(trainer, account));
    this.photoFileId.set(trainer.photoFileId);
    this.photoFileName.set(
      trainer.photoFileId === null ? null : this.translator.translate('trainers.edit.currentPhoto'),
    );
  }
}
