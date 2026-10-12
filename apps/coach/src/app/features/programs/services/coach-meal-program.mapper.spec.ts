import {
  isMealProgramPublished,
  toMealProgramDraft,
  toOwnFoodChoice,
  toUpdateMealProgramRequest,
} from './coach-meal-program.mapper';
import { MealProgramDetails } from './coach-program.dto';

const program: MealProgramDetails = {
  id: 'm1',
  name: null,
  startDate: '2026-10-01',
  endDate: '2026-10-07',
  isPublished: false,
  createdOnUtc: '2026-10-01T00:00:00Z',
  meals: [
    {
      id: 'meal-1',
      mealPlanId: 'm1',
      mealType: 1,
      plannedTime: '08:00:00',
      title: 'Breakfast',
      displayOrder: 0,
      items: [
        {
          id: 'item-1',
          mealPlanMealId: 'meal-1',
          foodId: 'f1',
          foodName: 'Oats',
          foodNameRu: 'Овсянка',
          foodNameUz: 'Suli',
          quantityGrams: 80,
          calories: 304,
          proteinGrams: 10,
          carbsGrams: 54,
          fatGrams: 6,
          estimatedCost: null,
        },
      ],
    },
  ],
};

describe('coach meal program mapper', () => {
  it('should keep backend ids as draft keys when a program is opened', () => {
    const draft = toMealProgramDraft(program);

    expect(draft.meals[0]).toMatchObject({ key: 'meal-1', id: 'meal-1', title: 'Breakfast' });
    expect(draft.meals[0].items[0]).toMatchObject({ key: 'item-1', foodId: 'f1', nameUz: 'Suli', calories: 304 });
  });

  it('should send the derived name and only food id, grams and cost for each item', () => {
    expect(toUpdateMealProgramRequest(toMealProgramDraft(program))).toEqual({
      name: '2026-10-01 – 2026-10-07',
      startDate: '2026-10-01',
      endDate: '2026-10-07',
      meals: [
        {
          mealType: 1,
          plannedTime: '08:00:00',
          title: 'Breakfast',
          displayOrder: 0,
          items: [{ foodId: 'f1', quantityGrams: 80, estimatedCost: null }],
        },
      ],
    });
  });

  it('should use the single name for every locale when the food belongs to the coach', () => {
    const choice = toOwnFoodChoice({
      id: 'f2',
      userId: 'u1',
      name: 'Coach mix',
      servingSizeGrams: 50,
      caloriesPerServing: 120,
      proteinGrams: 5,
      carbsGrams: 18,
      fatGrams: 3,
      fiberGrams: null,
      createdOnUtc: '2026-10-01T00:00:00Z',
    });

    expect(choice).toMatchObject({ name: 'Coach mix', nameRu: 'Coach mix', nameUz: 'Coach mix' });
  });

  it('should report a program as published only when its summary says so', () => {
    const summaries = [
      { id: 'm1', startDate: '', endDate: '', isPublished: true, mealCount: 0, createdOnUtc: '' },
    ];

    expect(isMealProgramPublished(summaries, 'm1')).toBe(true);
    expect(isMealProgramPublished(summaries, 'm2')).toBe(false);
  });
});
