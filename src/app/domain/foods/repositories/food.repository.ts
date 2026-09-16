import { Page, PageRequest } from '@domain/shared/paging/page';
import { Food } from '../entities/food';
import { FoodDraft } from '../food-draft';

/** The backend narrows the food list by free text only. */
export interface FoodFilter {
  readonly search?: string;
}

export abstract class FoodRepository {
  abstract list(filter: FoodFilter, page: PageRequest): Promise<Page<Food>>;

  abstract getById(id: string): Promise<Food>;

  /** @returns the food carrying this barcode, or `null` when the catalog has none. */
  abstract findByBarcode(barcode: string): Promise<Food | null>;

  /** @returns id of the created food. */
  abstract create(draft: FoodDraft): Promise<string>;

  abstract update(id: string, draft: FoodDraft): Promise<void>;

  abstract delete(id: string): Promise<void>;
}
