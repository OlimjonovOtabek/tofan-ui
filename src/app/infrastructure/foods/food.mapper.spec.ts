import { FOOD_SOURCES, SERVING_UNITS } from '@domain/foods/food-attributes';
import { FoodDraft } from '@domain/foods/food-draft';
import { FoodSource, ServingUnit } from '@infrastructure/api/generated';
import { foodSources, servingUnits, toCreateFoodRequest, toFood } from './food.mapper';

const draft: FoodDraft = {
  name: 'Plov',
  nameUz: 'Palov',
  nameRu: 'Плов',
  source: 'imported',
  servingUnit: 'piece',
  servingSize: 1,
  servingSizeGrams: 170,
  caloriesPerServing: 120,
  proteinGrams: 17,
  carbsGrams: 6,
  fatGrams: 3,
  isVerified: false,
  isActive: true,
  barcode: null,
  fiberGrams: null,
};

describe('food enum maps', () => {
  it('maps every domain value the catalog offers', () => {
    for (const value of SERVING_UNITS) {
      expect(servingUnits.toDomain(servingUnits.toApi(value))).toBe(value);
    }
    for (const value of FOOD_SOURCES) {
      expect(foodSources.toDomain(foodSources.toApi(value))).toBe(value);
    }
  });
});

describe('food mapper', () => {
  it('maps a response into the entity', () => {
    const food = toFood({
      id: '7',
      name: 'Greek yogurt',
      nameUz: 'Yunon yogurti',
      nameRu: 'Греческий йогурт',
      source: FoodSource.Imported,
      servingUnit: ServingUnit.Piece,
      servingSize: 1,
      servingSizeGrams: 170,
      caloriesPerServing: 120,
      proteinGrams: 17,
      carbsGrams: 6,
      fatGrams: 3,
      isVerified: false,
      isActive: true,
      isMine: false,
      isFavorite: false,
      barcode: '4780016470016',
      fiberGrams: null,
    });

    expect(food.source).toBe('imported');
    expect(food.servingUnit).toBe('piece');
    expect(food.hasBarcode()).toBe(true);
    expect(food.fiberGrams).toBeNull();
  });

  it('leaves the optional fields out of a create request', () => {
    const request = toCreateFoodRequest(draft);

    expect(request).not.toHaveProperty('barcode');
    expect(request).not.toHaveProperty('fiberGrams');
    expect(request.source).toBe(FoodSource.Imported);
    expect(request.servingUnit).toBe(ServingUnit.Piece);
  });

  it('sends the optional fields when they are filled in', () => {
    const request = toCreateFoodRequest({ ...draft, barcode: '123', fiberGrams: 2 });

    expect(request.barcode).toBe('123');
    expect(request.fiberGrams).toBe(2);
  });
});
