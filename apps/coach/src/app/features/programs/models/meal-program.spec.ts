import {
  Food,
  caloriesFor,
  defaultQuantity,
  formatQuantity,
  parseQuantity,
  unitsFor,
} from './food';
import { Meal, hasSeveralOptions, mealClock, mealOptions } from './meal-program';
import {
  canSubmitMealProgram,
  dayOrderIndexFor,
  mealDraftsOf,
  newMealDraft,
  optionCalories,
} from './meal-draft';

const egg: Food = {
  id: 'egg',
  name: { en: 'Egg', uz: 'Tuxum', ru: 'Яйцо' },
  servingUnit: 'piece',
  servingSize: 1,
  servingSizeGrams: 50,
  caloriesPerServing: 70,
};

const rice: Food = {
  ...egg,
  id: 'rice',
  servingUnit: 'grams',
  servingSize: 100,
  servingSizeGrams: 100,
  caloriesPerServing: 130,
};

const meal: Meal = {
  id: 'm1',
  type: 'breakfast',
  plannedTime: '08:30:00',
  title: 'Nonushta',
  items: [
    {
      id: 'i1',
      foodId: 'egg',
      name: egg.name,
      quantity: 2,
      unit: 'piece',
      quantityGrams: 100,
      calories: 140,
      estimatedCost: null,
      optionNumber: 1,
    },
    {
      id: 'i2',
      foodId: 'rice',
      name: rice.name,
      quantity: 150,
      unit: 'grams',
      quantityGrams: 150,
      calories: 195,
      estimatedCost: 3000,
      optionNumber: 2,
    },
  ],
};

describe('food portions', () => {
  it('should offer grams next to a piece unit but not next to grams', () => {
    expect(unitsFor(egg)).toEqual(['piece', 'grams']);
    expect(unitsFor(rice)).toEqual(['grams']);
  });

  it('should start from one serving or its weight in grams', () => {
    expect(defaultQuantity(egg, 'piece')).toBe(1);
    expect(defaultQuantity(egg, 'grams')).toBe(50);
  });

  it('should scale calories by the portion in either unit', () => {
    expect(caloriesFor(egg, 2, 'piece')).toBe(140);
    expect(caloriesFor(egg, 100, 'grams')).toBe(140);
    expect(caloriesFor({ ...egg, caloriesPerServing: null }, 1, 'piece')).toBeNull();
  });

  it('should parse a decimal comma and reject non positive quantities', () => {
    expect(parseQuantity('1,5')).toBe(1.5);
    expect(parseQuantity('0')).toBeNull();
    expect(parseQuantity('abc')).toBeNull();
    expect(formatQuantity(2)).toBe('2');
    expect(formatQuantity(1.25)).toBe('1.3');
  });
});

describe('mealOptions', () => {
  it('should group items by option and prefer the backend totals', () => {
    const options = mealOptions(meal, [
      {
        mealId: 'm1',
        optionNumber: 2,
        totals: { calories: 200, proteinGrams: 0, carbsGrams: 0, fatGrams: 0, estimatedCost: 0 },
      },
    ]);

    expect(options.map((option) => [option.number, option.items.length, option.calories])).toEqual([
      [1, 1, 140],
      [2, 1, 200],
    ]);
    expect(hasSeveralOptions([meal])).toBe(true);
    expect(mealClock(meal.plannedTime)).toBe('08:30');
  });
});

describe('meal drafts', () => {
  it('should insert a new meal in the order of the day', () => {
    const meals = [newMealDraft('a', 'breakfast', 'B'), newMealDraft('b', 'dinner', 'D')];

    expect(dayOrderIndexFor('lunch', meals)).toBe(1);
    expect(dayOrderIndexFor('postWorkout', meals)).toBe(2);
  });

  it('should need a name and food in every option before submitting', () => {
    const drafts = mealDraftsOf([meal]);

    expect(canSubmitMealProgram('Plan', drafts)).toBe(true);
    expect(canSubmitMealProgram(' ', drafts)).toBe(false);
    expect(canSubmitMealProgram('Plan', [newMealDraft('x', 'lunch', 'L')])).toBe(false);
    expect(canSubmitMealProgram('Plan', [])).toBe(false);
  });

  it('should rebuild picked foods per option from a saved meal', () => {
    const [draft] = mealDraftsOf([meal]);

    expect(draft.options.length).toBe(2);
    expect(optionCalories(draft.options[0])).toBe(140);
  });
});
