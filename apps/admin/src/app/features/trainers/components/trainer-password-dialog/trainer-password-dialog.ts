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
import { FormField, form, maxLength, minLength, required } from '@angular/forms/signals';
import { TranslationKey } from '@core/i18n/dictionary';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { FieldError } from '@shared/components/field-error/field-error';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import { PasswordField } from '@shared/components/password-field/password-field';
import { Trainer } from '../../models/trainer';
import {
  TRAINER_PASSWORD_MAX_LENGTH,
  TRAINER_PASSWORD_MIN_LENGTH,
} from '../../models/trainer-draft';

const PASSWORD_ERROR: TranslationKey = 'trainers.form.errors.password';

interface TrainerPasswordFormValue {
  password: string;
}

@Component({
  selector: 'app-trainer-password-dialog',
  imports: [FormField, FormDialog, FieldError, PasswordField, TranslatePipe],
  templateUrl: './trainer-password-dialog.html',
})
export class TrainerPasswordDialog {
  private readonly translator = inject(Translator);

  readonly visible = model.required<boolean>();
  readonly trainer = input<Trainer | null>(null);
  readonly saving = input(false);

  readonly save = output<string>();

  protected readonly header = computed(() =>
    this.translator.translate('trainers.password.header', {
      name: this.trainer()?.displayName ?? '',
    }),
  );
  protected readonly value = signal<TrainerPasswordFormValue>({ password: '' });
  protected readonly form = form(this.value, (path) => {
    required(path.password, { message: PASSWORD_ERROR });
    minLength(path.password, TRAINER_PASSWORD_MIN_LENGTH, { message: PASSWORD_ERROR });
    maxLength(path.password, TRAINER_PASSWORD_MAX_LENGTH, { message: PASSWORD_ERROR });
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => this.form().reset({ password: '' }));
      }
    });
  }

  protected submit(): void {
    this.form().markAsTouched();
    if (this.form().invalid()) {
      return;
    }
    this.save.emit(this.value().password);
  }
}
