import { FoodRepository } from '@domain/foods/repositories/food.repository';

export class DeleteFoodUseCase {
  constructor(private readonly foodRepository: FoodRepository) {}

  execute(id: string): Promise<void> {
    return this.foodRepository.delete(id);
  }
}
