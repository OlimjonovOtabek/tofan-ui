import { Component, computed, inject, input } from '@angular/core';
import { TranslationParams } from '@core/i18n/dictionary';
import { Translator } from '@core/i18n/translator';

interface FieldValidationError {
  readonly message?: string;
}

export interface FieldErrorSource {
  touched(): boolean;
  errors(): readonly FieldValidationError[];
}

@Component({
  selector: 'app-field-error',
  template: `
    @if (message(); as text) {
      <small class="text-red-500" role="alert">{{ text }}</small>
    }
  `,
})
export class FieldError {
  private readonly translator = inject(Translator);

  readonly field = input.required<FieldErrorSource>();

  protected readonly message = computed(() => {
    const field = this.field();
    if (!field.touched()) {
      return null;
    }
    const error = field.errors().find((candidate) => candidate.message !== undefined);
    if (error?.message === undefined) {
      return null;
    }
    return this.translator.message(error.message, paramsOf(error));
  });
}

function paramsOf(error: FieldValidationError): TranslationParams {
  return Object.fromEntries(
    Object.entries(error).filter(
      (entry): entry is [string, string | number] =>
        typeof entry[1] === 'string' || typeof entry[1] === 'number',
    ),
  );
}
