import { FoodDraft, createFoodDraft } from '@domain/foods/food-draft';
import { FoodRepository } from '@domain/foods/repositories/food.repository';

export class CreateFoodUseCase {
  constructor(private readonly foodRepository: FoodRepository) {}

  /** @throws ValidationError when the draft breaks a catalog rule. */
  execute(draft: FoodDraft): Promise<string> {
    return this.foodRepository.create(createFoodDraft(draft));
  }
}
