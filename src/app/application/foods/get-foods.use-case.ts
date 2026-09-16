import { Food } from '@domain/foods/entities/food';
import { FoodFilter, FoodRepository } from '@domain/foods/repositories/food.repository';
import { Page, PageRequest } from '@domain/shared/paging/page';

export class GetFoodsUseCase {
  constructor(private readonly foodRepository: FoodRepository) {}

  execute(filter: FoodFilter, page: PageRequest): Promise<Page<Food>> {
    return this.foodRepository.list(filter, page);
  }
}
