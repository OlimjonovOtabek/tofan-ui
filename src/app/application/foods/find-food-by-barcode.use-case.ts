import { Food } from '@domain/foods/entities/food';
import { FoodRepository } from '@domain/foods/repositories/food.repository';
import { ValidationError } from '@domain/shared/errors/validation.error';

export class FindFoodByBarcodeUseCase {
  constructor(private readonly foodRepository: FoodRepository) {}

  /**
   * @returns the food with this barcode, or `null` when it is not in the catalog yet.
   * @throws ValidationError when the barcode is blank.
   */
  execute(barcode: string): Promise<Food | null> {
    const normalized = barcode.trim();
    if (normalized.length === 0) {
      throw new ValidationError('The barcode is required.', [
        { code: 'Barcode.Empty', message: 'Barcode is required.' },
      ]);
    }
    return this.foodRepository.findByBarcode(normalized);
  }
}
