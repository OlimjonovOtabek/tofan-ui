import { Injectable, computed, inject, signal } from '@angular/core';
import { requireBarcode } from './models/barcode';
import { Food } from './models/food';
import { FoodDraft, createFoodDraft } from './models/food-draft';
import { FoodFilter } from './models/food-filter';
import { FoodsService } from './services/foods.service';
import { DEFAULT_PAGE_SIZE, Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';

@Injectable()
export class FoodsStore {
  private readonly foodsService = inject(FoodsService);
  private readonly notifications = inject(NotificationService);

  private readonly page = signal<Page<Food>>(emptyPage<Food>());
  private readonly currentFilter = signal<FoodFilter>({});
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly foods = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly searchingBarcode = signal(false);
  readonly first = computed(() => this.currentRequest().first);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.page.set(await this.foodsService.list(this.currentFilter(), request));
    } catch (error) {
      this.page.set(emptyPage<Food>());
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async applyFilter(filter: FoodFilter): Promise<void> {
    this.currentFilter.set(filter);
    await this.load(firstPage(this.currentRequest().rows || DEFAULT_PAGE_SIZE));
  }

  async findByBarcode(barcode: string): Promise<Food | null | undefined> {
    this.searchingBarcode.set(true);
    try {
      return await this.foodsService.findByBarcode(requireBarcode(barcode));
    } catch (error) {
      this.notifications.error(error);
      return undefined;
    } finally {
      this.searchingBarcode.set(false);
    }
  }

  async save(draft: FoodDraft, id: string | null): Promise<boolean> {
    this.saving.set(true);
    try {
      if (id === null) {
        await this.foodsService.create(createFoodDraft(draft));
      } else {
        await this.foodsService.update(id, createFoodDraft(draft));
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
      await this.foodsService.delete(food.id);
      this.notifications.success(`"${food.displayName}" o'chirildi.`);
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }
}
