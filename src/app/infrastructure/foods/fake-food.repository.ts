import { Injectable } from '@angular/core';
import { Food } from '@domain/foods/entities/food';
import { FoodDraft } from '@domain/foods/food-draft';
import { FoodFilter, FoodRepository } from '@domain/foods/repositories/food.repository';
import { NotFoundError } from '@domain/shared/errors/not-found.error';
import { Page, PageRequest } from '@domain/shared/paging/page';

const NETWORK_DELAY_MS = 250;

const SEED: readonly Food[] = [
  new Food(
    '11111111-1111-1111-1111-111111111111',
    'Plov',
    'Palov',
    'Плов',
    'system',
    'grams',
    100,
    100,
    220,
    7,
    27,
    9.5,
    true,
    true,
    null,
    1.2,
  ),
  new Food(
    '22222222-2222-2222-2222-222222222222',
    'Chicken breast',
    "Tovuq ko'kragi",
    'Куриная грудка',
    'system',
    'grams',
    100,
    100,
    165,
    31,
    0,
    3.6,
    true,
    true,
  ),
  new Food(
    '33333333-3333-3333-3333-333333333333',
    'Greek yogurt 2%',
    'Yunon yogurti 2%',
    'Греческий йогурт 2%',
    'imported',
    'piece',
    1,
    170,
    120,
    17,
    6,
    3,
    false,
    true,
    '4780016470016',
  ),
];

/** In-memory catalog for `useMockApi`, so the page can be used without a backend. */
@Injectable()
export class FakeFoodRepository implements FoodRepository {
  private foods = [...SEED];

  async list(filter: FoodFilter, page: PageRequest): Promise<Page<Food>> {
    await delay();
    const matching = this.foods.filter((food) => matches(food, filter));
    return {
      items: matching.slice(page.first, page.first + page.rows),
      totalCount: matching.length,
    };
  }

  async getById(id: string): Promise<Food> {
    await delay();
    return this.find(id);
  }

  async findByBarcode(barcode: string): Promise<Food | null> {
    await delay();
    return this.foods.find((food) => food.barcode === barcode) ?? null;
  }

  async create(draft: FoodDraft): Promise<string> {
    await delay();
    const id = crypto.randomUUID();
    this.foods = [toFood(id, draft), ...this.foods];
    return id;
  }

  async update(id: string, draft: FoodDraft): Promise<void> {
    await delay();
    this.find(id);
    this.foods = this.foods.map((food) => (food.id === id ? toFood(id, draft) : food));
  }

  async delete(id: string): Promise<void> {
    await delay();
    this.find(id);
    this.foods = this.foods.filter((food) => food.id !== id);
  }

  private find(id: string): Food {
    const food = this.foods.find((candidate) => candidate.id === id);
    if (food === undefined) {
      throw new NotFoundError('The food was not found.', 'Food.NotFound');
    }
    return food;
  }
}

function toFood(id: string, draft: FoodDraft): Food {
  return new Food(
    id,
    draft.name,
    draft.nameUz,
    draft.nameRu,
    draft.source,
    draft.servingUnit,
    draft.servingSize,
    draft.servingSizeGrams,
    draft.caloriesPerServing,
    draft.proteinGrams,
    draft.carbsGrams,
    draft.fatGrams,
    draft.isVerified,
    draft.isActive,
    draft.barcode,
    draft.fiberGrams,
  );
}

function matches(food: Food, filter: FoodFilter): boolean {
  const search = filter.search?.toLowerCase() ?? '';
  return (
    search.length === 0 ||
    [food.name, food.nameUz, food.nameRu, food.barcode ?? ''].some((value) =>
      value.toLowerCase().includes(search),
    )
  );
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
}
