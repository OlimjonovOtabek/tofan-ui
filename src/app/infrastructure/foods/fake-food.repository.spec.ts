import { FoodDraft } from '@domain/foods/food-draft';
import { NotFoundError } from '@domain/shared/errors/not-found.error';
import { firstPage } from '@domain/shared/paging/page';
import { FakeFoodRepository } from './fake-food.repository';

const draft: FoodDraft = {
  name: 'Somsa',
  nameUz: 'Somsa',
  nameRu: 'Самса',
  source: 'system',
  servingUnit: 'piece',
  servingSize: 1,
  servingSizeGrams: 150,
  caloriesPerServing: 420,
  proteinGrams: 14,
  carbsGrams: 38,
  fatGrams: 22,
  isVerified: false,
  isActive: true,
  barcode: '1234567890123',
  fiberGrams: null,
};

describe('FakeFoodRepository', () => {
  let repository: FakeFoodRepository;

  beforeEach(() => {
    repository = new FakeFoodRepository();
  });

  it('answers with the seeded catalog', async () => {
    await expect(repository.list({}, firstPage())).resolves.toMatchObject({ totalCount: 3 });
  });

  it('searches the names and the barcode', async () => {
    await expect(repository.list({ search: 'yogurt' }, firstPage())).resolves.toMatchObject({
      totalCount: 1,
    });
    await expect(repository.list({ search: '4780016470016' }, firstPage())).resolves.toMatchObject({
      totalCount: 1,
    });
  });

  it('finds a food by its barcode and answers null for an unknown one', async () => {
    await expect(repository.findByBarcode('4780016470016')).resolves.toMatchObject({
      nameUz: 'Yunon yogurti 2%',
    });
    await expect(repository.findByBarcode('0000000000000')).resolves.toBeNull();
  });

  it('creates, updates and deletes', async () => {
    const id = await repository.create(draft);
    await expect(repository.findByBarcode('1234567890123')).resolves.toMatchObject({ id });

    await repository.update(id, { ...draft, caloriesPerServing: 400 });
    await expect(repository.getById(id)).resolves.toMatchObject({ caloriesPerServing: 400 });

    await repository.delete(id);
    await expect(repository.getById(id)).rejects.toThrow(NotFoundError);
  });
});
