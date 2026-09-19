import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Food } from '../../models/food';
import { FoodDraft } from '../../models/food-draft';
import { FoodFilter } from '../../models/food-filter';
import { PageRequest } from '@shared/models/page';
import { FOOD_SOURCE_LABELS, SERVING_UNIT_LABELS } from '../../models/food-labels';
import { FoodsStore } from '../../foods.store';
import { DataTable, DataTableColumn } from '@shared/components/data-table/data-table';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { NotificationService } from '@core/feedback/notification.service';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Tag } from '@openng/optimus-ui/tag';
import { FoodFilters } from '../../components/food-filters/food-filters';
import { FoodFormDialog } from '../../components/food-form-dialog/food-form-dialog';

@Component({
  selector: 'app-foods-page',
  imports: [ReactiveFormsModule, DataTable, FoodFilters, FoodFormDialog, Button, InputText, Tag],
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

  protected readonly barcodeControl = this.formBuilder.control('');

  protected readonly dialogVisible = signal(false);
  protected readonly editedFood = signal<Food | null>(null);
  protected readonly prefilledBarcode = signal<string | null>(null);

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

  protected applyFilter(filter: FoodFilter): void {
    void this.store.applyFilter(filter);
  }

  protected loadPage(request: PageRequest): void {
    void this.store.load(request);
  }
}
