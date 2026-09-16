import { Injectable, inject } from '@angular/core';
import { Food } from '../models/food';
import { FoodDraft } from '../models/food-draft';
import { FoodFilter } from '../models/food-filter';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { Page, PageRequest } from '@shared/models/page';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPage, toPagedQuery } from '@core/http/paging.mapper';
import { FoodResponse } from './food.dto';
import { toCreateFoodRequest, toFood } from './food.mapper';

const FOODS = '/diet/foods';

@Injectable({ providedIn: 'root' })
export class FoodsService {
  private readonly apiClient = inject(ApiClient);

  async list(filter: FoodFilter, page: PageRequest): Promise<Page<Food>> {
    const list = await this.apiClient.get<PagedList<FoodResponse>>(FOODS, {
      ...toPagedQuery(page),
      Search: filter.search === undefined || filter.search.length === 0 ? undefined : filter.search,
    });
    return toPage(list, toFood);
  }

  async getById(id: string): Promise<Food> {
    return toFood(await this.apiClient.get<FoodResponse>(foodPath(id)));
  }

  async findByBarcode(barcode: string): Promise<Food | null> {
    try {
      const path = `${FOODS}/barcode/${encodeURIComponent(barcode)}`;
      return toFood(await this.apiClient.get<FoodResponse>(path));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return null;
      }
      throw error;
    }
  }

  create(draft: FoodDraft): Promise<string> {
    return this.apiClient.post<string>(FOODS, toCreateFoodRequest(draft));
  }

  async update(id: string, draft: FoodDraft): Promise<void> {
    await this.apiClient.put(foodPath(id), toCreateFoodRequest(draft));
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.delete(foodPath(id));
  }
}

function foodPath(id: string): string {
  return `${FOODS}/${encodeURIComponent(id)}`;
}
