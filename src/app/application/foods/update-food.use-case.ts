import { FoodDraft, createFoodDraft } from '@domain/foods/food-draft';
import { FoodRepository } from '@domain/foods/repositories/food.repository';

export class UpdateFoodUseCase {
  constructor(private readonly foodRepository: FoodRepository) {}

  /** @throws ValidationError when the draft breaks a catalog rule. */
  execute(id: string, draft: FoodDraft): Promise<void> {
    return this.foodRepository.update(id, createFoodDraft(draft));
  }
}
