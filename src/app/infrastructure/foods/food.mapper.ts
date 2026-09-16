import { Food } from '@domain/foods/entities/food';
import { FoodSource, ServingUnit } from '@domain/foods/food-attributes';
import { FoodDraft } from '@domain/foods/food-draft';
import { enumMap } from '@infrastructure/api/enum-map';
import {
  CreateFoodRequest,
  FoodResponse,
  FoodSource as ApiFoodSource,
  ServingUnit as ApiServingUnit,
} from '@infrastructure/api/generated';

export const foodSources = enumMap<FoodSource, ApiFoodSource>(ApiFoodSource);
export const servingUnits = enumMap<ServingUnit, ApiServingUnit>(ApiServingUnit);

export function toFood(response: FoodResponse): Food {
  return new Food(
    response.id,
    response.name,
    response.nameUz,
    response.nameRu,
    foodSources.toDomain(response.source),
    servingUnits.toDomain(response.servingUnit),
    response.servingSize,
    response.servingSizeGrams,
    response.caloriesPerServing,
    response.proteinGrams,
    response.carbsGrams,
    response.fatGrams,
    response.isVerified,
    response.isActive,
    response.barcode ?? null,
    response.fiberGrams ?? null,
  );
}

export function toCreateFoodRequest(draft: FoodDraft): CreateFoodRequest {
  return {
    name: draft.name,
    nameUz: draft.nameUz,
    nameRu: draft.nameRu,
    source: foodSources.toApi(draft.source),
    servingUnit: servingUnits.toApi(draft.servingUnit),
    servingSize: draft.servingSize,
    servingSizeGrams: draft.servingSizeGrams,
    caloriesPerServing: draft.caloriesPerServing,
    proteinGrams: draft.proteinGrams,
    carbsGrams: draft.carbsGrams,
    fatGrams: draft.fatGrams,
    isVerified: draft.isVerified,
    isActive: draft.isActive,
    ...(draft.barcode === null ? {} : { barcode: draft.barcode }),
    ...(draft.fiberGrams === null ? {} : { fiberGrams: draft.fiberGrams }),
  };
}
