import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ValidationError } from '@shared/models/errors/validation.error';
import { FoodsStore } from './foods.store';
import { Food } from './models/food';
import { FoodDraft } from './models/food-draft';
import { FoodsService } from './services/foods.service';

const draft: FoodDraft = {
  name: ' Plov ',
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
  fiberGrams: null,
};

const plov = new Food(
  '1',
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
);

describe('FoodsStore', () => {
  let service: Pick<FoodsService, 'list' | 'findByBarcode' | 'create' | 'update' | 'delete'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  function createStore(): FoodsStore {
    TestBed.configureTestingModule({
      providers: [
        FoodsStore,
        { provide: FoodsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(FoodsStore);
  }

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue({ items: [plov], totalCount: 1 }),
      findByBarcode: vi.fn().mockResolvedValue(plov),
      create: vi.fn().mockResolvedValue('1'),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should expose the page when the service answers', async () => {
    const store = createStore();

    await store.load();

    expect(store.foods()).toEqual([plov]);
    expect(store.totalCount()).toBe(1);
  });

  it('should go back to the first page when a filter is applied', async () => {
    const store = createStore();
    await store.load({ first: 50, rows: 25 });

    await store.applyFilter({ search: 'plov' });

    expect(service.list).toHaveBeenLastCalledWith({ search: 'plov' }, { first: 0, rows: 25 });
  });

  it('should look up the trimmed barcode when searching by barcode', async () => {
    const store = createStore();

    await expect(store.findByBarcode(' 4780016470016 ')).resolves.toBe(plov);

    expect(service.findByBarcode).toHaveBeenCalledWith('4780016470016');
    expect(store.searchingBarcode()).toBe(false);
  });

  it('should answer undefined and show the error when the barcode is blank', async () => {
    const store = createStore();

    await expect(store.findByBarcode('  ')).resolves.toBeUndefined();

    expect(service.findByBarcode).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith(expect.any(ValidationError));
  });

  it('should create a trimmed food when no id is given', async () => {
    const store = createStore();

    await expect(store.save(draft, null)).resolves.toBe(true);

    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Plov' }));
  });

  it('should update the food when an id is given', async () => {
    const store = createStore();

    await store.save(draft, '1');

    expect(service.update).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'Plov' }));
  });

  it('should report failure when the backend rejects the save', async () => {
    vi.mocked(service.create).mockRejectedValue(new Error('offline'));
    const store = createStore();

    await expect(store.save(draft, null)).resolves.toBe(false);

    expect(notifications.error).toHaveBeenCalled();
    expect(store.saving()).toBe(false);
  });

  it('should delete the food and reload when removing', async () => {
    const store = createStore();

    await store.remove(plov);

    expect(service.delete).toHaveBeenCalledWith('1');
    expect(service.list).toHaveBeenCalled();
  });
});
