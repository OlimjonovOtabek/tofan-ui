import { FoodRepository } from '@domain/foods/repositories/food.repository';
import { ValidationError } from '@domain/shared/errors/validation.error';
import { FindFoodByBarcodeUseCase } from './find-food-by-barcode.use-case';

describe('FindFoodByBarcodeUseCase', () => {
  let foodRepository: FoodRepository;
  let useCase: FindFoodByBarcodeUseCase;

  beforeEach(() => {
    foodRepository = {
      list: vi.fn(),
      getById: vi.fn(),
      findByBarcode: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new FindFoodByBarcodeUseCase(foodRepository);
  });

  it('looks up the trimmed barcode', async () => {
    await useCase.execute('  4780016470016 ');

    expect(foodRepository.findByBarcode).toHaveBeenCalledWith('4780016470016');
  });

  it('does not call the backend for a blank barcode', async () => {
    await expect(() => useCase.execute('   ')).toThrow(ValidationError);

    expect(foodRepository.findByBarcode).not.toHaveBeenCalled();
  });
});
