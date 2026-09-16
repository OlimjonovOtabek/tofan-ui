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
  readonly idPrefix = input('localized');
  readonly multiline = input(false);
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
