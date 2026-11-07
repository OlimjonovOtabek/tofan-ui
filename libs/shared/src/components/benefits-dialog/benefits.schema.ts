import { Schema, SchemaPath, applyEach, schema, validate } from '@angular/forms/signals';
import { TranslationKey } from '@core/i18n/dictionary';
import { BENEFIT_TEXT_MAX_LENGTH, Benefit, benefitTextProblem } from '@shared/models/benefit';

const ERRORS = {
  required: 'common.benefits.errors.required',
  tooLong: 'common.benefits.errors.tooLong',
} as const satisfies Record<string, TranslationKey>;

export interface BenefitRow {
  key: string;
  en: string;
  ru: string;
  uz: string;
}

export interface BenefitsFormValue {
  rows: BenefitRow[];
}

export function toBenefitRows(benefits: readonly Benefit[], newKey: () => string): BenefitRow[] {
  return benefits.map((benefit) => ({
    key: newKey(),
    en: benefit.en,
    ru: benefit.ru,
    uz: benefit.uz,
  }));
}

export function emptyBenefitRow(key: string): BenefitRow {
  return { key, en: '', ru: '', uz: '' };
}

export function toBenefits(rows: readonly BenefitRow[]): Benefit[] {
  return rows.map((row) => ({
    en: row.en.trim(),
    ru: row.ru.trim(),
    uz: row.uz.trim(),
  }));
}

export const benefitsFormSchema: Schema<BenefitsFormValue> = schema<BenefitsFormValue>((path) => {
  applyEach(path.rows, (row) => {
    applyTextRules(row.en);
    applyTextRules(row.ru);
    applyTextRules(row.uz);
  });
});

function applyTextRules(path: SchemaPath<string>): void {
  validate(path, ({ value }) => {
    const problem = benefitTextProblem(value());
    if (problem === 'required') {
      return { kind: 'required', message: ERRORS.required };
    }
    if (problem === 'tooLong') {
      return { kind: 'tooLong', message: ERRORS.tooLong, max: BENEFIT_TEXT_MAX_LENGTH };
    }
    return null;
  });
}
