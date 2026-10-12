import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { CoachFoodPickerStore } from './coach-food-picker.store';
import { CatalogFood, OwnFood } from './services/coach-program-library.dto';
import { CoachProgramLibraryService } from './services/coach-program-library.service';

const catalogFood: CatalogFood = {
  id: 'f1',
  name: 'Oats',
  nameUz: 'Suli',
  nameRu: 'Овсянка',
  servingSizeGrams: 100,
  caloriesPerServing: 380,
  proteinGrams: 13,
  carbsGrams: 68,
  fatGrams: 7,
  fiberGrams: 10,
  source: 1,
  servingUnit: 1,
  isVerified: true,
  isActive: true,
  isFavorite: false,
  isMine: false,
};

const ownFood: OwnFood = {
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
};

describe('CoachFoodPickerStore', () => {
  let library: Pick<CoachProgramLibraryService, 'listFoodCatalog' | 'listOwnFoods'>;
  let notifications: Pick<NotificationService, 'error'>;

  beforeEach(() => {
    library = {
      listFoodCatalog: vi.fn().mockResolvedValue([catalogFood]),
      listOwnFoods: vi.fn().mockResolvedValue([ownFood]),
    };
    notifications = { error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        CoachFoodPickerStore,
        { provide: CoachProgramLibraryService, useValue: library },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('should search the catalog with the trimmed text when the catalog is the source', async () => {
    const store = TestBed.inject(CoachFoodPickerStore);
    store.searchText.set(' oat ');

    await store.load();

    expect(library.listFoodCatalog).toHaveBeenCalledWith('oat');
    expect(store.options()[0].id).toBe('f1');
  });

  it('should list the coach foods when the source changes to own', async () => {
    const store = TestBed.inject(CoachFoodPickerStore);

    await store.setSource('own');

    expect(store.options()).toEqual([expect.objectContaining({ id: 'f2', nameUz: 'Coach mix' })]);
  });

  it('should show no options and report the error when the search fails', async () => {
    vi.mocked(library.listFoodCatalog).mockRejectedValue(new ServiceUnavailableError());
    const store = TestBed.inject(CoachFoodPickerStore);

    await store.reset();

    expect(store.options()).toEqual([]);
    expect(notifications.error).toHaveBeenCalled();
  });
});
