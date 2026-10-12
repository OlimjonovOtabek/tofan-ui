import { ValidationError, ValidationIssue } from '@shared/models/errors/validation.error';
import { isAfterDay, startOfDay } from '@shared/utils/calendar-date';
import { GarmentSize } from './garment-catalog';

export const GARMENT_TEXT_MAX_LENGTH = 200;

export interface GarmentDraft {
  readonly model: string;
  readonly color: string;
  readonly size: GarmentSize;
  readonly material: string;
  readonly manufacturedAt: Date;
}

export function latestManufacturingDay(now: Date): Date {
  return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function createGarmentDraft(draft: GarmentDraft, now: Date): GarmentDraft {
  const prepared: GarmentDraft = {
    ...draft,
    model: draft.model.trim(),
    color: draft.color.trim().toUpperCase(),
    material: draft.material.trim(),
    manufacturedAt: startOfDay(draft.manufacturedAt),
  };

  const issues = [...missingFields(prepared), ...tooLongFields(prepared)];
  if (isAfterDay(prepared.manufacturedAt, latestManufacturingDay(now))) {
    issues.push({
      code: 'Garment.ManufacturedInFuture',
      message: 'The manufacturing date cannot be in the future.',
    });
  }
  if (issues.length > 0) {
    throw new ValidationError('The garment is not valid.', issues);
  }
  return prepared;
}

function missingFields(draft: GarmentDraft): ValidationIssue[] {
  return draft.model.length === 0 ? [{ code: 'Model.Empty', message: 'Model is required.' }] : [];
}

function tooLongFields(draft: GarmentDraft): ValidationIssue[] {
  const limits: readonly [string, string][] = [
    ['Model', draft.model],
    ['Color', draft.color],
    ['Material', draft.material],
  ];
  return limits
    .filter(([, value]) => value.length > GARMENT_TEXT_MAX_LENGTH)
    .map(([field]) => ({
      code: `${field}.TooLong`,
      message: `${field} must be at most ${GARMENT_TEXT_MAX_LENGTH} characters.`,
    }));
}
