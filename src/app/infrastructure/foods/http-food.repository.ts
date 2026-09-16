import { Injectable, inject } from '@angular/core';
import { Food } from '@domain/foods/entities/food';
import { FoodDraft } from '@domain/foods/food-draft';
import { FoodFilter, FoodRepository } from '@domain/foods/repositories/food.repository';
import { NotFoundError } from '@domain/shared/errors/not-found.error';
import { Page, PageRequest } from '@domain/shared/paging/page';
import { ApiClient } from '@infrastructure/api/api-client';
import { toPage, toPagedQuery } from '@infrastructure/api/paging.mapper';
import {
  deleteDietFoodsById,
  getDietFoods,
  getDietFoodsBarcodeByBarcode,
  getDietFoodsById,
  postDietFoods,
  putDietFoodsById,
} from '@infrastructure/api/generated';
import { toCreateFoodRequest, toFood } from './food.mapper';

@Injectable()
export class HttpFoodRepository implements FoodRepository {
  private readonly apiClient = inject(ApiClient);

  async list(filter: FoodFilter, page: PageRequest): Promise<Page<Food>> {
    const list = await this.apiClient.invoke(getDietFoods, {
      ...toPagedQuery(page),
      ...(filter.search === undefined || filter.search.length === 0
        ? {}
        : { Search: filter.search }),
    });
    return toPage(list, toFood);
  }

  async getById(id: string): Promise<Food> {
    return toFood(await this.apiClient.invoke(getDietFoodsById, { id }));
  }

  /** The backend answers 404 for an unknown barcode, which is an answer here, not a failure. */
  async findByBarcode(barcode: string): Promise<Food | null> {
    try {
      return toFood(await this.apiClient.invoke(getDietFoodsBarcodeByBarcode, { barcode }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return null;
      }
      throw error;
    }
  }

  create(draft: FoodDraft): Promise<string> {
    return this.apiClient.invoke(postDietFoods, { body: toCreateFoodRequest(draft) });
  }

  async update(id: string, draft: FoodDraft): Promise<void> {
    await this.apiClient.invoke(putDietFoodsById, { id, body: toCreateFoodRequest(draft) });
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.invoke(deleteDietFoodsById, { id });
  }
}
