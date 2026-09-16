import { Food } from './food';

function food(servingSizeGrams: number, nameUz = 'Palov'): Food {
  return new Food(
    '1',
    'Plov',
    nameUz,
    'Плов',
    'system',
    'piece',
    1,
    servingSizeGrams,
    340,
    17,
    40,
    12,
    true,
    true,
  );
}

describe('Food', () => {
  it('should show the Uzbek name when it is filled in', () => {
    expect(food(200).displayName).toBe('Palov');
    expect(food(200, '').displayName).toBe('Plov');
  });

  it('should normalise the nutrition to 100 grams when the serving weight is known', () => {
    expect(food(200).per100Grams).toEqual({
      calories: 170,
      proteinGrams: 8.5,
      carbsGrams: 20,
      fatGrams: 6,
    });
  });

  it('should have nothing to normalise when the serving weight is unknown', () => {
    expect(food(0).per100Grams).toBeNull();
  });
});
