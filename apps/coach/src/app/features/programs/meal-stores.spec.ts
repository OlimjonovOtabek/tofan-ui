import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { FoodPickerStore } from './food-picker.store';
import { MealProgramFormStore } from './meal-program-form.store';
import { MealProgramStore } from './meal-program.store';
import { Food, PickedFood } from './models/food';
import { MealProgramsService } from './services/meal-programs.service';

const egg: Food = {
  id: 'egg',
  name: { en: 'Egg', uz: 'Tuxum', ru: 'Яйцо' },
  servingUnit: 'piece',
  servingSize: 1,
  servingSizeGrams: 50,
  caloriesPerServing: 70,
};
const picked: PickedFood = { food: egg, quantity: 2, unit: 'piece', estimatedCost: null };

describe('meal stores', () => {
  const service = {
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
    delete: vi.fn(),
    searchFoods: vi.fn(),
  };
  const notifications = { success: vi.fn(), error: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        MealProgramStore,
        MealProgramFormStore,
        FoodPickerStore,
        { provide: MealProgramsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  describe('MealProgramFormStore', () => {
    it('should build meals in day order with options and foods, then submit', async () => {
      const store = TestBed.inject(MealProgramFormStore);
      store.name.set('Cut');
      store.addMeal('dinner', 'Kechki');
      store.addMeal('breakfast', 'Nonushta');
      const [first] = store.meals();
      store.addFood(first.key, 0, picked);
      store.addOption(first.key);
      store.addFood(first.key, 1, picked);
      store.addFood(store.meals()[1].key, 0, picked);
      service.create.mockResolvedValue('m1');

      expect(store.meals().map((meal) => meal.type)).toEqual(['breakfast', 'dinner']);
      expect(await store.submit()).toBe('m1');
      expect(service.create).toHaveBeenCalledWith('Cut', null, store.meals());
    });

    it('should block submitting while an option has no food', () => {
      const store = TestBed.inject(MealProgramFormStore);
      store.name.set('Cut');
      store.addMeal('lunch', 'Tushlik');

      expect(store.canSubmit()).toBe(false);
    });

    it('should keep one option and drop a chosen one', () => {
      const store = TestBed.inject(MealProgramFormStore);
      store.addMeal('lunch', 'Tushlik');
      const key = store.meals()[0].key;
      store.removeOption(key, 0);
      store.addOption(key);
      store.removeOption(key, 0);

      expect(store.meals()[0].options.length).toBe(1);
    });
  });

  describe('MealProgramStore', () => {
    it('should publish and reload, and delete without reloading', async () => {
      const store = TestBed.inject(MealProgramStore);
      service.get.mockResolvedValue({ id: 'm1', isPublished: false });
      await store.load('m1');
      service.get.mockResolvedValue({ id: 'm1', isPublished: true });

      await store.togglePublished();
      expect(store.program()?.isPublished).toBe(true);

      service.get.mockClear();
      expect(await store.delete()).toBe(true);
      expect(service.get).not.toHaveBeenCalled();
    });
  });

  describe('FoodPickerStore', () => {
    it('should ignore an old answer when a newer search started', async () => {
      const store = TestBed.inject(FoodPickerStore);
      let late: (foods: Food[]) => void = () => undefined;
      service.searchFoods.mockReturnValueOnce(new Promise<Food[]>((resolve) => (late = resolve)));
      service.searchFoods.mockResolvedValueOnce([egg]);

      const first = store.search('e');
      await store.search('eg');
      late([]);
      await first;

      expect(store.foods()).toEqual([egg]);
    });
  });
});
