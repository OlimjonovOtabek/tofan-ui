import { Component, effect, input, model, output, signal, untracked } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { FieldError } from '@shared/components/field-error/field-error';
import { FileUpload } from '@shared/components/file-upload/file-upload';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { TextField } from '@shared/components/text-field/text-field';
import { TrainerDraft } from '../../models/trainer-draft';
import {
  TrainerFormValue,
  emptyTrainerFormValue,
  toTrainerDraft,
  trainerFormSchema,
} from './trainer-form.schema';

@Component({
  selector: 'app-trainer-form-dialog',
  imports: [FormField, FormDialog, FieldError, FileUpload, TextField, TranslatePipe],
  templateUrl: './trainer-form-dialog.html',
})
export class TrainerFormDialog {
  readonly visible = model.required<boolean>();
  readonly saving = input(false);

  readonly save = output<TrainerDraft>();

  protected readonly value = signal<TrainerFormValue>(emptyTrainerFormValue());
  protected readonly form = form(this.value, trainerFormSchema);
  protected readonly photoFileId = signal<string | null>(null);
  protected readonly photoFileName = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => this.prepare());
      }
    });
  }

  protected submit(): void {
    this.form().markAsTouched();
    if (this.form().invalid()) {
      return;
    }
    this.save.emit(toTrainerDraft(this.value(), this.photoFileId()));
  }

  private prepare(): void {
    this.form().reset(emptyTrainerFormValue());
    this.photoFileId.set(null);
    this.photoFileName.set(null);
  }
}
