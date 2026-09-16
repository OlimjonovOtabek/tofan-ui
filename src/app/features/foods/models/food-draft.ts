import { ValidationError, ValidationIssue } from '@shared/models/errors/validation.error';
import { FoodSource, ServingUnit } from './food-attributes';

export interface FoodDraft {
  readonly name: string;
  readonly nameUz: string;
  readonly nameRu: string;
  readonly source: FoodSource;
  readonly servingUnit: ServingUnit;
  readonly servingSize: number;
  readonly servingSizeGrams: number;
  readonly caloriesPerServing: number;
  readonly proteinGrams: number;
  readonly carbsGrams: number;
  readonly fatGrams: number;
  readonly isVerified: boolean;
  readonly isActive: boolean;
  readonly barcode: string | null;
  readonly fiberGrams: number | null;
}

export function createFoodDraft(draft: FoodDraft): FoodDraft {
  const name = draft.name.trim();
  const nameUz = draft.nameUz.trim();
  const nameRu = draft.nameRu.trim();
  const barcode = draft.barcode?.trim() ?? '';

  const issues: ValidationIssue[] = [
    ...missingName('Name', name),
    ...missingName('NameUz', nameUz),
    ...missingName('NameRu', nameRu),
    ...positive('ServingSize', draft.servingSize),
    ...positive('ServingSizeGrams', draft.servingSizeGrams),
    ...notNegative('CaloriesPerServing', draft.caloriesPerServing),
    ...notNegative('ProteinGrams', draft.proteinGrams),
    ...notNegative('CarbsGrams', draft.carbsGrams),
    ...notNegative('FatGrams', draft.fatGrams),
    ...(draft.fiberGrams === null ? [] : notNegative('FiberGrams', draft.fiberGrams)),
  ];
  if (issues.length > 0) {
    throw new ValidationError('The food cannot be saved as it is.', issues);
  }

  return {
    ...draft,
    name,
    nameUz,
    nameRu,
    barcode: barcode.length === 0 ? null : barcode,
  };
}

function missingName(field: string, value: string): ValidationIssue[] {
  return value.length === 0 ? [{ code: `${field}.Empty`, message: `${field} is required.` }] : [];
}

function positive(field: string, value: number): ValidationIssue[] {
  return value > 0
    ? []
    : [{ code: `${field}.NotPositive`, message: `${field} must be greater than zero.` }];
}

function notNegative(field: string, value: number): ValidationIssue[] {
  return value >= 0 ? [] : [{ code: `${field}.Negative`, message: `${field} cannot be negative.` }];
}
