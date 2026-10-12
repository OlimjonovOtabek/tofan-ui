import { TestBed } from '@angular/core/testing';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { NotificationService } from '@core/feedback/notification.service';
import { CatalogFood } from './services/coach-program-library.dto';
import { CoachProgramsService } from './services/coach-programs.service';
import { CoachMealEditorStore } from './coach-meal-editor.store';

const program = {
  id: 'm1',
  name: null,
  startDate: '2026-10-01',
  endDate: '2026-10-07',
  isPublished: false,
  createdOnUtc: '2026-10-01T00:00:00Z',
  meals: [],
};

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

describe('CoachMealEditorStore', () => {
  let programs: Pick<CoachProgramsService, 'getMealPlan' | 'listMealPrograms' | 'updateMealPlan'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  beforeEach(() => {
    programs = {
      getMealPlan: vi.fn().mockResolvedValue(program),
      listMealPrograms: vi.fn().mockResolvedValue([
        { id: 'm1', startDate: program.startDate, endDate: program.endDate, isPublished: true, mealCount: 0, createdOnUtc: program.createdOnUtc },
      ]),
      updateMealPlan: vi.fn().mockResolvedValue(undefined),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        CoachMealEditorStore,
        { provide: CoachProgramsService, useValue: programs },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('should expose the meal plan publication state', async () => {
    const store = TestBed.inject(CoachMealEditorStore);

    await store.load('m1');

    expect(store.isPublished()).toBe(true);
  });

  it('should calculate displayed nutrition from the selected food quantity', async () => {
    const store = TestBed.inject(CoachMealEditorStore);
    await store.load('m1');
    store.addMeal('breakfast', 'Breakfast');
    const meal = store.draft()?.meals[0];
    expect(meal).toBeDefined();
    if (meal === undefined) {
      throw new Error('Meal draft was not added.');
    }
    store.addFood(meal.key, {
      id: catalogFood.id,
      name: catalogFood.name,
      nameRu: catalogFood.nameRu,
      nameUz: catalogFood.nameUz,
      servingSizeGrams: catalogFood.servingSizeGrams,
      caloriesPerServing: catalogFood.caloriesPerServing,
      proteinGrams: catalogFood.proteinGrams,
      carbsGrams: catalogFood.carbsGrams,
      fatGrams: catalogFood.fatGrams,
      fiberGrams: catalogFood.fiberGrams,
    });
    const item = store.draft()?.meals[0].items[0];
    expect(item?.calories).toBe(380);
    store.updateFoodQuantity(meal.key, item?.key ?? '', 50);

    expect(store.draft()?.meals[0].items[0].calories).toBe(190);
  });

  it('should save complete meal contents through the documented update contract', async () => {
    const store = TestBed.inject(CoachMealEditorStore);
    await store.load('m1');
    store.addMeal('breakfast', 'Breakfast');
    const meal = store.draft()?.meals[0];
    expect(meal).toBeDefined();
    if (meal === undefined) {
      throw new Error('Meal draft was not added.');
    }

    await expect(store.save()).resolves.toBe(true);

    expect(programs.updateMealPlan).toHaveBeenCalledWith('m1', {
      name: '2026-10-01 – 2026-10-07',
      startDate: '2026-10-01',
      endDate: '2026-10-07',
      meals: [{ mealType: 1, plannedTime: null, title: 'Breakfast', displayOrder: 0, items: [] }],
    });
  });

  it('should sum calories and macros across several meals and fractional quantities', async () => {
    const store = TestBed.inject(CoachMealEditorStore);
    await store.load('m1');
    store.addMeal('breakfast', 'Breakfast');
    store.addMeal('lunch', 'Lunch');
    const [breakfast, lunch] = store.draft()?.meals ?? [];
    const choice = {
      id: 'f9', name: 'Rice', nameRu: 'Рис', nameUz: 'Guruch', servingSizeGrams: 100,
      caloriesPerServing: 130, proteinGrams: 2.7, carbsGrams: 28, fatGrams: 0, fiberGrams: null,
    };

    store.addFoods(breakfast.key, [choice, { ...choice, id: 'f10' }]);
    store.addFood(lunch.key, choice);
    const item = store.draft()?.meals[0].items[0];
    store.updateFoodQuantity(breakfast.key, item?.key ?? '', 50.5);

    expect(store.totals().calories).toBe(66 + 130 + 130);
    expect(store.totals().fatGrams).toBe(0);
    expect(store.mealTotals(store.draft()?.meals[1] ?? breakfast).calories).toBe(130);
  });

  it('should refuse to save when the date range is reversed', async () => {
    const store = TestBed.inject(CoachMealEditorStore);
    await store.load('m1');
    store.updateDates('2026-10-09', '2026-10-01');

    await expect(store.save()).resolves.toBe(false);

    expect(store.issue()).toBe('dates');
    expect(store.showIssue()).toBe(true);
    expect(programs.updateMealPlan).not.toHaveBeenCalled();
  });

  it('should refuse to save a non-positive quantity', async () => {
    const store = TestBed.inject(CoachMealEditorStore);
    await store.load('m1');
    store.addMeal('breakfast', 'Breakfast');
    const meal = store.draft()?.meals[0];
    store.addFood(meal?.key ?? '', {
      id: 'f9', name: 'Rice', nameRu: 'Рис', nameUz: 'Guruch', servingSizeGrams: 100,
      caloriesPerServing: 130, proteinGrams: 2.7, carbsGrams: 28, fatGrams: 0, fiberGrams: null,
    });
    store.updateFoodQuantity(meal?.key ?? '', store.draft()?.meals[0].items[0].key ?? '', 0);

    expect(store.issue()).toBe('quantity');
    await expect(store.save()).resolves.toBe(false);
  });

  it('should keep the draft and allow retry when the save request fails', async () => {
    vi.mocked(programs.updateMealPlan).mockRejectedValueOnce(new ServiceUnavailableError());
    const store = TestBed.inject(CoachMealEditorStore);
    await store.load('m1');
    store.addMeal('breakfast', 'Breakfast');

    await expect(store.save()).resolves.toBe(false);
    expect(store.draft()?.meals[0].title).toBe('Breakfast');
    expect(store.dirty()).toBe(true);
    await expect(store.save()).resolves.toBe(true);
    expect(programs.updateMealPlan).toHaveBeenCalledTimes(2);
  });

  it('should not start a second save while one is running', async () => {
    let release: () => void = () => undefined;
    vi.mocked(programs.updateMealPlan).mockReturnValue(new Promise<void>((resolve) => (release = resolve)));
    const store = TestBed.inject(CoachMealEditorStore);
    await store.load('m1');
    store.addMeal('breakfast', 'Breakfast');

    const first = store.save();
    await expect(store.save()).resolves.toBe(false);
    release();
    await first;

    expect(programs.updateMealPlan).toHaveBeenCalledTimes(1);
  });
});
