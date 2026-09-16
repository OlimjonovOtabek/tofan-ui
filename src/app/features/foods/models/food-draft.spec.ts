import { ValidationError } from '@shared/models/errors/validation.error';
import { FoodDraft, createFoodDraft } from './food-draft';

const draft: FoodDraft = {
  name: 'Plov',
  nameUz: 'Palov',
  nameRu: 'Плов',
  source: 'system',
  servingUnit: 'grams',
  servingSize: 100,
  servingSizeGrams: 100,
  caloriesPerServing: 220,
  proteinGrams: 7,
  carbsGrams: 27,
  fatGrams: 9.5,
  isVerified: true,
  isActive: true,
  barcode: null,
  fiberGrams: 1.2,
};

function issueCodesOf(changes: Partial<FoodDraft>): string[] {
  try {
    createFoodDraft({ ...draft, ...changes });
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return (error as ValidationError).issues.map((issue) => issue.code);
  }
  throw new Error('Expected the draft to be rejected.');
}

describe('createFoodDraft', () => {
  it('trims the text a user typed', () => {
    const prepared = createFoodDraft({ ...draft, name: ' Plov ', barcode: ' 4780016470016 ' });

    expect(prepared.name).toBe('Plov');
    expect(prepared.barcode).toBe('4780016470016');
  });

  it('treats a blank barcode as none', () => {
    expect(createFoodDraft({ ...draft, barcode: '  ' }).barcode).toBeNull();
  });

  it('names every language that is missing', () => {
    expect(issueCodesOf({ name: '', nameRu: ' ' })).toEqual(['Name.Empty', 'NameRu.Empty']);
  });

  it('refuses a serving that cannot be converted to grams', () => {
    expect(issueCodesOf({ servingSize: 0 })).toEqual(['ServingSize.NotPositive']);
    expect(issueCodesOf({ servingSizeGrams: -5 })).toEqual(['ServingSizeGrams.NotPositive']);
  });

  it('refuses negative nutrition', () => {
    expect(issueCodesOf({ caloriesPerServing: -1 })).toEqual(['CaloriesPerServing.Negative']);
    expect(issueCodesOf({ proteinGrams: -1, fatGrams: -2 })).toEqual([
      'ProteinGrams.Negative',
      'FatGrams.Negative',
    ]);
    expect(issueCodesOf({ fiberGrams: -1 })).toEqual(['FiberGrams.Negative']);
  });

  it('accepts a food without fiber data', () => {
    expect(createFoodDraft({ ...draft, fiberGrams: null }).fiberGrams).toBeNull();
  });
});
