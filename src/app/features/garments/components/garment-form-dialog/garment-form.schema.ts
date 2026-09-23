import { Signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/dictionary';
import { Schema, maxDate, maxLength, pattern, required, schema } from '@angular/forms/signals';
import { HEX_COLOR_PATTERN } from '@shared/utils/hex-color';
import { GarmentSize } from '../../models/garment-catalog';
import { GARMENT_TEXT_MAX_LENGTH, GarmentDraft } from '../../models/garment-draft';

const ERRORS = {
  model: 'garments.form.errors.model',
  color: 'garments.form.errors.color',
  colorFormat: 'garments.form.errors.colorFormat',
  size: 'garments.form.errors.size',
  tooLong: 'garments.form.errors.tooLong',
  manufacturedAt: 'garments.form.errors.manufacturedAt',
  future: 'garments.form.errors.future',
} as const satisfies Record<string, TranslationKey>;

export interface GarmentFormValue {
  model: string;
  color: string;
  size: GarmentSize | null;
  material: string;
  manufacturedAt: Date | null;
}

export function emptyGarmentFormValue(latestDay: Date): GarmentFormValue {
  return {
    model: '',
    color: '',
    size: null,
    material: '',
    manufacturedAt: latestDay,
  };
}

export function toGarmentDraft(value: GarmentFormValue): GarmentDraft | null {
  const { size, manufacturedAt } = value;
  if (size === null || manufacturedAt === null) {
    return null;
  }
  return {
    model: value.model,
    color: value.color,
    size,
    material: value.material,
    manufacturedAt,
  };
}

export function garmentFormSchema(latestDay: Signal<Date>): Schema<GarmentFormValue> {
  return schema<GarmentFormValue>((path) => {
    required(path.model, { message: ERRORS.model });
    maxLength(path.model, GARMENT_TEXT_MAX_LENGTH, { message: ERRORS.tooLong });
    required(path.color, { message: ERRORS.color });
    pattern(path.color, HEX_COLOR_PATTERN, { message: ERRORS.colorFormat });
    required(path.size, { message: ERRORS.size });
    maxLength(path.material, GARMENT_TEXT_MAX_LENGTH, { message: ERRORS.tooLong });
    required(path.manufacturedAt, { message: ERRORS.manufacturedAt });
    maxDate(path.manufacturedAt, () => latestDay(), { message: ERRORS.future });
  });
}
