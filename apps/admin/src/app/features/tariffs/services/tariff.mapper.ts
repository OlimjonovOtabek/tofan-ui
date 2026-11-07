import { LocalizedText } from '@shared/models/localized-text';
import { enumMap } from '@shared/utils/enum-map';
import { MealType } from '../models/meal-type';
import { Tariff } from '../models/tariff';
import { TariffDraft } from '../models/tariff-draft';
import { TariffType, compareTariffTypes } from '../models/tariff-type';
import {
  ChangeTariffRequest,
  MealType as ApiMealType,
  TariffBenefitResponse,
  TariffResponse,
  TariffType as ApiTariffType,
} from './tariff.dto';

export const tariffTypes = enumMap<TariffType, ApiTariffType>(ApiTariffType);
const mealTypes = enumMap<MealType, ApiMealType>(ApiMealType);

export function toTariff(response: TariffResponse): Tariff {
  return {
    id: response.id,
    type: tariffTypes.toDomain(response.type),
    monthlyPrice: response.monthlyPrice,
    totalPrice: response.totalPrice,
    foodScanLimit: response.foodScanLimit,
    workoutVideoLimit: response.workoutVideoLimit,
    dietMealTypes: response.dietMealTypes?.map((type) => mealTypes.toDomain(type)) ?? null,
    workoutChangeMonths: response.workoutChangeMonths,
    dietChangeDays: response.dietChangeDays,
    hasAiTrainerChat: response.hasAiTrainerChat,
    benefits: response.benefits.map(toBenefitText),
  };
}

export function toTariffs(responses: readonly TariffResponse[]): readonly Tariff[] {
  return responses.map(toTariff).sort((left, right) => compareTariffTypes(left.type, right.type));
}

export function toChangeTariffRequest(draft: TariffDraft): ChangeTariffRequest {
  return {
    monthlyPrice: draft.monthlyPrice,
    foodScanLimit: draft.foodScanLimit,
    workoutVideoLimit: draft.workoutVideoLimit,
    dietMealTypes: draft.dietMealTypes?.map((type) => mealTypes.toApi(type)) ?? null,
    workoutChangeMonths: draft.workoutChangeMonths,
    dietChangeDays: draft.dietChangeDays,
    hasAiTrainerChat: draft.hasAiTrainerChat,
  };
}

function toBenefitText(benefit: TariffBenefitResponse): LocalizedText {
  return { en: benefit.name, ru: benefit.nameRu, uz: benefit.nameUz };
}
