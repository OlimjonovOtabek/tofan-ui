import { Component, computed, inject, signal } from '@angular/core';
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
import { Translator } from '@core/i18n/translator';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { localizedNameField, pickLocalized } from '@shared/models/localized-text';
import { LocaleStore } from '@core/i18n/locale.store';

@Component({
  selector: 'app-foods-page',
  imports: [
    ReactiveFormsModule,
    DataTable,
    FoodFilters,
    FoodFormDialog,
    Button,
    InputText,
    Tag,
    TranslatePipe,
  ],
  providers: [FoodsStore],
  templateUrl: './foods-page.html',
})
export class FoodsPage {
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly notifications = inject(NotificationService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(FoodsStore);

  protected readonly columns = computed<readonly DataTableColumn[]>(() => [
    {
      field: localizedNameField(this.localeStore.locale()),
      header: this.translator.translate('foods.page.columns.name'),
      sortable: true,
    },
    { field: 'servingSize', header: this.translator.translate('foods.page.columns.serving') },
    {
      field: 'caloriesPerServing',
      header: this.translator.translate('foods.page.columns.calories'),
      sortable: true,
    },
    { field: 'macros', header: this.translator.translate('foods.page.columns.macros') },
    { field: 'source', header: this.translator.translate('foods.page.columns.source') },
    {
      field: 'isActive',
      header: this.translator.translate('foods.page.columns.activity'),
      width: '11rem',
    },
    { field: 'actions', header: '', width: '8rem' },
  ]);

  protected readonly barcodeControl = this.formBuilder.control('');

  protected readonly dialogVisible = signal(false);
  protected readonly editedFood = signal<Food | null>(null);
  protected readonly prefilledBarcode = signal<string | null>(null);

  protected foodName(food: Food): string {
    return pickLocalized(food.names, this.localeStore.locale());
  }

  protected foodSubname(food: Food): string {
    return food.names.en;
  }

  protected servingLabel(food: Food): string {
    return `${food.servingSize} ${this.translator.translate(SERVING_UNIT_LABELS[food.servingUnit])} • ${food.servingSizeGrams} g`;
  }

  protected macrosLabel(food: Food): string {
    return `${food.proteinGrams} / ${food.carbsGrams} / ${food.fatGrams}`;
  }

  protected sourceLabel(food: Food): string {
    return this.translator.translate(FOOD_SOURCE_LABELS[food.source]);
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
      this.notifications.info('foods.page.barcodeNotFound', { barcode });
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
    if (await this.confirmations.confirmDelete(this.foodName(food))) {
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
