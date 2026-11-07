import { TranslationKey } from '@core/i18n/dictionary';
import {
  PathKind,
  Schema,
  SchemaPath,
  SchemaPathRules,
  disabled,
  minLength,
  min,
  required,
  schema,
  validate,
} from '@angular/forms/signals';
import { MEAL_TYPES, MealType } from '../../models/meal-type';
import { Tariff } from '../../models/tariff';
import {
  MIN_DIET_CHANGE_DAYS,
  MIN_FOOD_SCAN_LIMIT,
  MIN_WORKOUT_CHANGE_MONTHS,
  MIN_WORKOUT_VIDEO_LIMIT,
  TariffDraft,
} from '../../models/tariff-draft';
import { TariffType, isFreeTariff } from '../../models/tariff-type';

const ERRORS = {
  price: 'tariffs.form.errors.price',
  scanLimit: 'tariffs.form.errors.scanLimit',
  videoLimit: 'tariffs.form.errors.videoLimit',
  changeMonths: 'tariffs.form.errors.changeMonths',
  changeDays: 'tariffs.form.errors.changeDays',
  mealTypes: 'tariffs.form.errors.mealTypes',
} as const satisfies Record<string, TranslationKey>;

const FREE_PRICE = 0;

type LimitPath = SchemaPath<number | null, SchemaPathRules.Supported, PathKind.Child>;

export interface TariffFormValue {
  monthlyPrice: number | null;
  foodScanUnlimited: boolean;
  foodScanLimit: number | null;
  workoutVideoUnlimited: boolean;
  workoutVideoLimit: number | null;
  allMealTypes: boolean;
  mealTypes: MealType[];
  workoutNeverChanges: boolean;
  workoutChangeMonths: number | null;
  dietNeverChanges: boolean;
  dietChangeDays: number | null;
  hasAiTrainerChat: boolean;
}

export function emptyTariffFormValue(): TariffFormValue {
  return {
    monthlyPrice: null,
    foodScanUnlimited: true,
    foodScanLimit: null,
    workoutVideoUnlimited: true,
    workoutVideoLimit: null,
    allMealTypes: true,
    mealTypes: [],
    workoutNeverChanges: true,
    workoutChangeMonths: null,
    dietNeverChanges: true,
    dietChangeDays: null,
    hasAiTrainerChat: false,
  };
}

export function tariffFormValue(tariff: Tariff): TariffFormValue {
  return {
    monthlyPrice: tariff.monthlyPrice,
    foodScanUnlimited: tariff.foodScanLimit === null,
    foodScanLimit: tariff.foodScanLimit,
    workoutVideoUnlimited: tariff.workoutVideoLimit === null,
    workoutVideoLimit: tariff.workoutVideoLimit,
    allMealTypes: tariff.dietMealTypes === null,
    mealTypes: [...(tariff.dietMealTypes ?? [])],
    workoutNeverChanges: tariff.workoutChangeMonths === null,
    workoutChangeMonths: tariff.workoutChangeMonths,
    dietNeverChanges: tariff.dietChangeDays === null,
    dietChangeDays: tariff.dietChangeDays,
    hasAiTrainerChat: tariff.hasAiTrainerChat,
  };
}

export function toTariffDraft(value: TariffFormValue, type: TariffType): TariffDraft | null {
  if (!isFilled(value, type)) {
    return null;
  }
  return {
    monthlyPrice: isFreeTariff(type) ? FREE_PRICE : (value.monthlyPrice ?? FREE_PRICE),
    foodScanLimit: limitOf(value.foodScanUnlimited, value.foodScanLimit),
    workoutVideoLimit: limitOf(value.workoutVideoUnlimited, value.workoutVideoLimit),
    dietMealTypes: value.allMealTypes
      ? null
      : MEAL_TYPES.filter((t) => value.mealTypes.includes(t)),
    workoutChangeMonths: limitOf(value.workoutNeverChanges, value.workoutChangeMonths),
    dietChangeDays: limitOf(value.dietNeverChanges, value.dietChangeDays),
    hasAiTrainerChat: value.hasAiTrainerChat,
  };
}

export function tariffFormSchema(typeOf: () => TariffType): Schema<TariffFormValue> {
  return schema<TariffFormValue>((path) => {
    disabled(path.monthlyPrice, { when: () => isFreeTariff(typeOf()) });
    required(path.monthlyPrice, { message: ERRORS.price });
    validate(path.monthlyPrice, ({ value }) =>
      (value() ?? 0) > FREE_PRICE ? null : { kind: 'positive', message: ERRORS.price },
    );

    limitRules(path.foodScanLimit, path.foodScanUnlimited, MIN_FOOD_SCAN_LIMIT, ERRORS.scanLimit);
    limitRules(
      path.workoutVideoLimit,
      path.workoutVideoUnlimited,
      MIN_WORKOUT_VIDEO_LIMIT,
      ERRORS.videoLimit,
    );
    limitRules(
      path.workoutChangeMonths,
      path.workoutNeverChanges,
      MIN_WORKOUT_CHANGE_MONTHS,
      ERRORS.changeMonths,
    );
    limitRules(path.dietChangeDays, path.dietNeverChanges, MIN_DIET_CHANGE_DAYS, ERRORS.changeDays);

    disabled(path.mealTypes, { when: ({ valueOf }) => valueOf(path.allMealTypes) });
    minLength(path.mealTypes, 1, { message: ERRORS.mealTypes });
  });
}

function limitRules(
  limit: LimitPath,
  switchedOn: SchemaPath<boolean, SchemaPathRules.Supported, PathKind.Child>,
  minimum: number,
  message: TranslationKey,
): void {
  disabled(limit, { when: ({ valueOf }) => valueOf(switchedOn) });
  required(limit, { message });
  min(limit, minimum, { message });
}

function limitOf(switchedOn: boolean, limit: number | null): number | null {
  return switchedOn ? null : limit;
}

function isFilled(value: TariffFormValue, type: TariffType): boolean {
  return (
    (isFreeTariff(type) || value.monthlyPrice !== null) &&
    (value.foodScanUnlimited || value.foodScanLimit !== null) &&
    (value.workoutVideoUnlimited || value.workoutVideoLimit !== null) &&
    (value.allMealTypes || value.mealTypes.length > 0) &&
    (value.workoutNeverChanges || value.workoutChangeMonths !== null) &&
    (value.dietNeverChanges || value.dietChangeDays !== null)
  );
}
