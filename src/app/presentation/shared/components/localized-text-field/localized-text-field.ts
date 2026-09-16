import { Component, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputText } from '@openng/optimus-ui/inputtext';

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

export function createLocalizedTextGroup(
  formBuilder: NonNullableFormBuilder,
  value: Partial<LocalizedText> = {},
): FormGroup<LocalizedTextControls> {
  return formBuilder.group({
    name: [value.name ?? '', Validators.required],
    nameUz: [value.nameUz ?? '', Validators.required],
    nameRu: [value.nameRu ?? '', Validators.required],
  });
}

const LANGUAGES = [
  { control: 'name', code: 'EN', hint: 'asosiy' },
  { control: 'nameUz', code: 'UZ', hint: "o'zbekcha" },
  { control: 'nameRu', code: 'RU', hint: 'ruscha' },
] as const;

@Component({
  selector: 'app-localized-text-field',
  imports: [ReactiveFormsModule, InputText],
  templateUrl: './localized-text-field.html',
})
export class LocalizedTextField {
  readonly group = input.required<FormGroup<LocalizedTextControls>>();
  readonly label = input('Nomi');

  protected readonly languages = LANGUAGES;

  protected isInvalid(control: keyof LocalizedTextControls): boolean {
    const field = this.group().controls[control];
    return field.invalid && field.touched;
  }
}
