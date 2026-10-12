import {
  MealFoodChoice,
  MealProgramDraft,
  mealDraftIssue,
  newMeal,
  newMealItem,
  nutritionTotals,
  withQuantity,
} from './coach-meal-draft';

const oats: MealFoodChoice = {
  id: 'f1',
  name: 'Oats',
  nameRu: 'Овсянка',
  nameUz: 'Suli',
  servingSizeGrams: 50,
  caloriesPerServing: 190,
  proteinGrams: 6,
  carbsGrams: 34,
  fatGrams: 3,
  fiberGrams: 5,
};

function draft(values: Partial<MealProgramDraft> = {}): MealProgramDraft {
  return { startDate: '2026-10-01', endDate: '2026-10-07', meals: [], ...values };
}

describe('coach meal draft', () => {
  it('should scale a new item to one hundred grams from the food serving', () => {
    expect(newMealItem('i1', oats)).toMatchObject({
      quantityGrams: 100,
      calories: 380,
      proteinGrams: 12,
      carbsGrams: 68,
      fatGrams: 6,
    });
  });

  it('should rescale the nutrition when the quantity changes', () => {
    const half = withQuantity(newMealItem('i1', oats), 50);

    expect(half).toMatchObject({ quantityGrams: 50, calories: 190, proteinGrams: 6 });
  });

  it('should sum the nutrition of every item', () => {
    const totals = nutritionTotals([newMealItem('i1', oats), newMealItem('i2', oats)]);

    expect(totals).toEqual({ calories: 760, proteinGrams: 24, carbsGrams: 136, fatGrams: 12 });
  });

  it('should report a dates issue when the start is after the end', () => {
    expect(mealDraftIssue(draft({ startDate: '2026-10-08' }))).toBe('dates');
  });

  it('should report a quantity issue when an item has no grams', () => {
    const meal = { ...newMeal('m1', 'breakfast', ' Breakfast ', 0), items: [withQuantity(newMealItem('i1', oats), 0)] };

    expect(meal.title).toBe('Breakfast');
    expect(mealDraftIssue(draft({ meals: [meal] }))).toBe('quantity');
  });

  it('should report no issue when the dates and quantities are valid', () => {
    const meal = { ...newMeal('m1', 'breakfast', 'Breakfast', 0), items: [newMealItem('i1', oats)] };

    expect(mealDraftIssue(draft({ meals: [meal] }))).toBeNull();
    expect(mealDraftIssue(null)).toBeNull();
  });
});
