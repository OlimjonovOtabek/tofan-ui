import { Component, effect, inject, input, model, output, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Food } from '@domain/foods/entities/food';
import { FoodSource, ServingUnit } from '@domain/foods/food-attributes';
import { FoodDraft } from '@domain/foods/food-draft';
import { FOOD_SOURCE_OPTIONS, SERVING_UNIT_OPTIONS } from '@presentation/foods/food-labels';
import { FormDialog } from '@presentation/shared/components/form-dialog/form-dialog';
import {
  LocalizedTextField,
  createLocalizedTextGroup,
} from '@presentation/shared/components/localized-text-field/localized-text-field';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';
import { ToggleSwitch } from '@openng/optimus-ui/toggleswitch';

/** Create and edit form of the food catalog. Nutrition values are per serving. */
@Component({
  selector: 'app-food-form-dialog',
  imports: [
    ReactiveFormsModule,
    FormDialog,
    LocalizedTextField,
    InputNumber,
    InputText,
    Select,
    ToggleSwitch,
  ],
  templateUrl: './food-form-dialog.html',
})
export class FoodFormDialog {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly visible = model.required<boolean>();
  /** The food being edited, or `null` while a new one is created. */
  readonly food = input<Food | null>(null);
  /** Prefills the barcode of a food that a scan did not find in the catalog. */
  readonly barcode = input<string | null>(null);
  readonly saving = input(false);

  readonly save = output<FoodDraft>();

  protected readonly sourceOptions = FOOD_SOURCE_OPTIONS;
  protected readonly servingUnitOptions = SERVING_UNIT_OPTIONS;

  protected readonly names = createLocalizedTextGroup(this.formBuilder);
  protected readonly form = this.formBuilder.group({
    names: this.names,
    source: this.formBuilder.control<FoodSource>('system', Validators.required),
    barcode: this.formBuilder.control(''),
    servingUnit: this.formBuilder.control<ServingUnit>('grams', Validators.required),
    servingSize: this.formBuilder.control(100, [Validators.required, Validators.min(0.01)]),
    servingSizeGrams: this.formBuilder.control(100, [Validators.required, Validators.min(0.01)]),
    caloriesPerServing: this.formBuilder.control(0, [Validators.required, Validators.min(0)]),
    proteinGrams: this.formBuilder.control(0, [Validators.required, Validators.min(0)]),
    carbsGrams: this.formBuilder.control(0, [Validators.required, Validators.min(0)]),
    fatGrams: this.formBuilder.control(0, [Validators.required, Validators.min(0)]),
    fiberGrams: this.formBuilder.control<number | null>(null, Validators.min(0)),
    isVerified: this.formBuilder.control(false),
    isActive: this.formBuilder.control(true),
  });

  constructor() {
    // Reload the form whenever the dialog opens, so an edit never shows the previous food.
    effect(() => {
      if (this.visible()) {
        untracked(() => this.reset(this.food()));
      }
    });
  }

  protected title(): string {
    return this.food() === null ? "Ovqat qo'shish" : 'Ovqatni tahrirlash';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.save.emit({
      name: value.names.name,
      nameUz: value.names.nameUz,
      nameRu: value.names.nameRu,
      source: value.source,
      servingUnit: value.servingUnit,
      servingSize: value.servingSize,
      servingSizeGrams: value.servingSizeGrams,
      caloriesPerServing: value.caloriesPerServing,
      proteinGrams: value.proteinGrams,
      carbsGrams: value.carbsGrams,
      fatGrams: value.fatGrams,
      fiberGrams: value.fiberGrams,
      isVerified: value.isVerified,
      isActive: value.isActive,
      barcode: value.barcode,
    });
  }

  protected isInvalid(control: keyof typeof this.form.controls): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }

  private reset(food: Food | null): void {
    this.form.reset({
      names: {
        name: food?.name ?? '',
        nameUz: food?.nameUz ?? '',
        nameRu: food?.nameRu ?? '',
      },
      source: food?.source ?? 'system',
      barcode: food?.barcode ?? this.barcode() ?? '',
      servingUnit: food?.servingUnit ?? 'grams',
      servingSize: food?.servingSize ?? 100,
      servingSizeGrams: food?.servingSizeGrams ?? 100,
      caloriesPerServing: food?.caloriesPerServing ?? 0,
      proteinGrams: food?.proteinGrams ?? 0,
      carbsGrams: food?.carbsGrams ?? 0,
      fatGrams: food?.fatGrams ?? 0,
      fiberGrams: food?.fiberGrams ?? null,
      isVerified: food?.isVerified ?? false,
      isActive: food?.isActive ?? true,
    });
  }
}
