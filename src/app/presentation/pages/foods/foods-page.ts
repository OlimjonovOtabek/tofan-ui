import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Food } from '@domain/foods/entities/food';
import { FoodDraft } from '@domain/foods/food-draft';
import { PageRequest } from '@domain/shared/paging/page';
import { FOOD_SOURCE_LABELS, SERVING_UNIT_LABELS } from '@presentation/foods/food-labels';
import { FoodsStore } from '@presentation/foods/foods.store';
import { DataTable, DataTableColumn } from '@presentation/shared/components/data-table/data-table';
import { ConfirmDialogService } from '@presentation/shared/feedback/confirmation.service';
import { NotificationService } from '@presentation/shared/feedback/notification.service';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Tag } from '@openng/optimus-ui/tag';
import { debounceTime } from 'rxjs';
import { FoodFormDialog } from './food-form-dialog';

const SEARCH_DEBOUNCE_MS = 400;

@Component({
  selector: 'app-foods-page',
  imports: [ReactiveFormsModule, DataTable, FoodFormDialog, Button, InputText, Tag],
  providers: [FoodsStore],
  templateUrl: './foods-page.html',
})
export class FoodsPage {
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly notifications = inject(NotificationService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly store = inject(FoodsStore);

  protected readonly columns: readonly DataTableColumn[] = [
    { field: 'nameUz', header: 'Nomi', sortable: true },
    { field: 'servingSize', header: 'Porsiya' },
    { field: 'caloriesPerServing', header: 'Kaloriya', sortable: true },
    { field: 'macros', header: 'O / U / Y' },
    { field: 'source', header: 'Manba' },
    { field: 'isActive', header: 'Holati', width: '11rem' },
    { field: 'actions', header: '', width: '8rem' },
  ];

  protected readonly searchControl = this.formBuilder.control('');
  protected readonly barcodeControl = this.formBuilder.control('');

  protected readonly dialogVisible = signal(false);
  protected readonly editedFood = signal<Food | null>(null);
  protected readonly prefilledBarcode = signal<string | null>(null);

  constructor() {
    // The first page is loaded by the table itself, which emits `(pageChange)` as it renders.
    this.searchControl.valueChanges
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed())
      .subscribe((search) => {
        void this.store.applyFilter(search.trim().length === 0 ? {} : { search: search.trim() });
      });
  }

  /**
   * Row templates are handed to the table as content, so Angular cannot infer their type and the
   * row arrives as `any`. These accessors put the typing back in one place.
   */
  protected servingLabel(food: Food): string {
    return `${food.servingSize} ${SERVING_UNIT_LABELS[food.servingUnit]} · ${food.servingSizeGrams} g`;
  }

  protected macrosLabel(food: Food): string {
    return `${food.proteinGrams} / ${food.carbsGrams} / ${food.fatGrams}`;
  }

  protected sourceLabel(food: Food): string {
    return FOOD_SOURCE_LABELS[food.source];
  }

  protected caloriesLabel(food: Food): string {
    const per100 = food.per100Grams;
    return per100 === null
      ? `${food.caloriesPerServing} kcal`
      : `${food.caloriesPerServing} kcal (100 g: ${Math.round(per100.calories)})`;
  }

  protected add(): void {
    this.editedFood.set(null);
    this.prefilledBarcode.set(null);
    this.dialogVisible.set(true);
  }

  protected edit(food: Food): void {
    this.editedFood.set(food);
    this.prefilledBarcode.set(null);
    this.dialogVisible.set(true);
  }

  /** Opens the food behind the barcode, or the create form prefilled with it. */
  protected async searchBarcode(): Promise<void> {
    const barcode = this.barcodeControl.value.trim();
    if (barcode.length === 0) {
      return;
    }

    const found = await this.store.findByBarcode(barcode);
    if (found === undefined) {
      return;
    }
    if (found === null) {
      this.notifications.info(`"${barcode}" katalogda yo'q. Yangi ovqat sifatida qo'shing.`);
      this.editedFood.set(null);
      this.prefilledBarcode.set(barcode);
    } else {
      this.editedFood.set(found);
      this.prefilledBarcode.set(null);
    }
    this.dialogVisible.set(true);
  }

  protected async saveDraft(draft: FoodDraft): Promise<void> {
    const saved = await this.store.save(draft, this.editedFood()?.id ?? null);
    if (saved) {
      this.dialogVisible.set(false);
      this.barcodeControl.setValue('');
    }
  }

  protected async remove(food: Food): Promise<void> {
    if (await this.confirmations.confirmDelete(food.displayName)) {
      await this.store.remove(food);
    }
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }
}
