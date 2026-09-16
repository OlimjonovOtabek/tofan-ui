import { Component, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Textarea } from '@openng/optimus-ui/textarea';

/** Catalog records carry the same text in three languages (`name`, `nameUz`, `nameRu`). */
export interface LocalizedTextControls {
  name: FormControl<string>;
  nameUz: FormControl<string>;
  nameRu: FormControl<string>;
}

export interface LocalizedText {
  name: string;
  nameUz: string;
  nameRu: string;
}

export interface LocalizedTextOptions {
  /** Mirrors a backend length limit, so the form stops the admin before the request does. */
  readonly maxLength?: number;
}

export function createLocalizedTextGroup(
  formBuilder: NonNullableFormBuilder,
  value: Partial<LocalizedText> = {},
  { maxLength }: LocalizedTextOptions = {},
): FormGroup<LocalizedTextControls> {
  const validators =
    maxLength === undefined
      ? [Validators.required]
      : [Validators.required, Validators.maxLength(maxLength)];
  return formBuilder.group({
    name: [value.name ?? '', validators],
    nameUz: [value.nameUz ?? '', validators],
    nameRu: [value.nameRu ?? '', validators],
  });
}

const LANGUAGES = [
  { control: 'name', code: 'EN', hint: 'asosiy' },
  { control: 'nameUz', code: 'UZ', hint: "o'zbekcha" },
  { control: 'nameRu', code: 'RU', hint: 'ruscha' },
] as const;

@Component({
  selector: 'app-localized-text-field',
  imports: [ReactiveFormsModule, InputText, Textarea],
  templateUrl: './localized-text-field.html',
})
export class LocalizedTextField {
  readonly group = input.required<FormGroup<LocalizedTextControls>>();
  readonly label = input('Nomi');
  /** Keeps element ids unique when one form holds several localized fields. */
  readonly idPrefix = input('localized');
  /** Renders text areas instead of single-line inputs, for message bodies. */
  readonly multiline = input(false);
  /** Shows a character counter; the limit itself is enforced by the group's validators. */
  readonly maxLength = input<number | null>(null);

  protected readonly languages = LANGUAGES;

  protected inputId(control: keyof LocalizedTextControls): string {
    return `${this.idPrefix()}-${control}`;
  }

  protected isInvalid(control: keyof LocalizedTextControls): boolean {
    const field = this.group().controls[control];
    return field.invalid && field.touched;
  }

  protected isTooLong(control: keyof LocalizedTextControls): boolean {
    return this.group().controls[control].hasError('maxlength');
  }

  protected lengthOf(control: keyof LocalizedTextControls): number {
    return this.group().controls[control].value.length;
  }
}
