import { Injectable, computed, inject, signal } from '@angular/core';
import { CreateFoodUseCase } from '@application/foods/create-food.use-case';
import { DeleteFoodUseCase } from '@application/foods/delete-food.use-case';
import { FindFoodByBarcodeUseCase } from '@application/foods/find-food-by-barcode.use-case';
import { GetFoodsUseCase } from '@application/foods/get-foods.use-case';
import { UpdateFoodUseCase } from '@application/foods/update-food.use-case';
import { Food } from '@domain/foods/entities/food';
import { FoodDraft } from '@domain/foods/food-draft';
import { FoodFilter } from '@domain/foods/repositories/food.repository';
import {
  DEFAULT_PAGE_SIZE,
  Page,
  PageRequest,
  emptyPage,
  firstPage,
} from '@domain/shared/paging/page';
import { NotificationService } from '@presentation/shared/feedback/notification.service';

/** View state of the food catalog: one page of the list plus the search that produced it. */
@Injectable()
export class FoodsStore {
  private readonly getFoodsUseCase = inject(GetFoodsUseCase);
  private readonly findByBarcodeUseCase = inject(FindFoodByBarcodeUseCase);
  private readonly createFoodUseCase = inject(CreateFoodUseCase);
  private readonly updateFoodUseCase = inject(UpdateFoodUseCase);
  private readonly deleteFoodUseCase = inject(DeleteFoodUseCase);
  private readonly notifications = inject(NotificationService);

  private readonly page = signal<Page<Food>>(emptyPage<Food>());
  private readonly currentFilter = signal<FoodFilter>({});
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly foods = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly searchingBarcode = signal(false);
  readonly first = computed(() => this.currentRequest().first);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    try {
      this.page.set(await this.getFoodsUseCase.execute(this.currentFilter(), request));
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.loading.set(false);
    }
  }

  async applyFilter(filter: FoodFilter): Promise<void> {
    this.currentFilter.set(filter);
    await this.load(firstPage(this.currentRequest().rows || DEFAULT_PAGE_SIZE));
  }

  /** @returns the food with this barcode, `null` when the catalog has none, `undefined` on error. */
  async findByBarcode(barcode: string): Promise<Food | null | undefined> {
    this.searchingBarcode.set(true);
    try {
      return await this.findByBarcodeUseCase.execute(barcode);
    } catch (error) {
      this.notifications.error(error);
      return undefined;
    } finally {
      this.searchingBarcode.set(false);
    }
  }

  /** @returns true when the food was saved, so the caller can close its dialog. */
  async save(draft: FoodDraft, id: string | null): Promise<boolean> {
    this.saving.set(true);
    try {
      if (id === null) {
        await this.createFoodUseCase.execute(draft);
      } else {
        await this.updateFoodUseCase.execute(id, draft);
      }
      this.notifications.success(id === null ? "Ovqat qo'shildi." : 'Ovqat saqlandi.');
      await this.load();
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async remove(food: Food): Promise<void> {
    try {
      await this.deleteFoodUseCase.execute(food.id);
      this.notifications.success(`"${food.displayName}" o'chirildi.`);
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }
}
