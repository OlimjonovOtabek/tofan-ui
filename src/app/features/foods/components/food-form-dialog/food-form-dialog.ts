import { Component, computed, effect, inject, input, model, output, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Food } from '../../models/food';
import { FoodSource, ServingUnit } from '../../models/food-attributes';
import { FoodDraft } from '../../models/food-draft';
import { FOOD_SOURCE_OPTIONS, SERVING_UNIT_OPTIONS } from '../../models/food-labels';
import { FormDialog } from '@shared/components/form-dialog/form-dialog';
import {
  LocalizedTextField,
  createLocalizedTextGroup,
} from '@shared/components/localized-text-field/localized-text-field';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';
import { ToggleSwitch } from '@openng/optimus-ui/toggleswitch';
import { Translator } from '@core/i18n/translator';
import { TranslatePipe } from '@core/i18n/translate.pipe';

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
    TranslatePipe,
  ],
  templateUrl: './food-form-dialog.html',
})
export class FoodFormDialog {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly translator = inject(Translator);

  readonly visible = model.required<boolean>();
  readonly food = input<Food | null>(null);
  readonly barcode = input<string | null>(null);
  readonly saving = input(false);

  readonly save = output<FoodDraft>();

  protected readonly sourceOptions = computed(() => FOOD_SOURCE_OPTIONS.map(o => ({ ...o, label: this.translator.translate(o.label) })));
  protected readonly servingUnitOptions = computed(() => SERVING_UNIT_OPTIONS.map(o => ({ ...o, label: this.translator.translate(o.label) })));

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
    effect(() => {
      if (this.visible()) {
        untracked(() => this.reset(this.food()));
      }
    });
  }

  protected title(): string {
    return this.food() === null 
      ? this.translator.translate('foods.form.addTitle') 
      : this.translator.translate('foods.form.editTitle');
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
        name: food?.names.en ?? '',
        nameUz: food?.names.uz ?? '',
        nameRu: food?.names.ru ?? '',
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
