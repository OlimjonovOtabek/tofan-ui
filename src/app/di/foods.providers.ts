import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { CreateFoodUseCase } from '@application/foods/create-food.use-case';
import { DeleteFoodUseCase } from '@application/foods/delete-food.use-case';
import { FindFoodByBarcodeUseCase } from '@application/foods/find-food-by-barcode.use-case';
import { GetFoodsUseCase } from '@application/foods/get-foods.use-case';
import { UpdateFoodUseCase } from '@application/foods/update-food.use-case';
import { FoodRepository } from '@domain/foods/repositories/food.repository';
import { FakeFoodRepository } from '@infrastructure/foods/fake-food.repository';
import { HttpFoodRepository } from '@infrastructure/foods/http-food.repository';

export interface FoodsProvidersOptions {
  readonly useMockApi: boolean;
}

export function provideFoods({ useMockApi }: FoodsProvidersOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: FoodRepository, useClass: useMockApi ? FakeFoodRepository : HttpFoodRepository },
    { provide: GetFoodsUseCase, useFactory: () => new GetFoodsUseCase(inject(FoodRepository)) },
    {
      provide: FindFoodByBarcodeUseCase,
      useFactory: () => new FindFoodByBarcodeUseCase(inject(FoodRepository)),
    },
    { provide: CreateFoodUseCase, useFactory: () => new CreateFoodUseCase(inject(FoodRepository)) },
    { provide: UpdateFoodUseCase, useFactory: () => new UpdateFoodUseCase(inject(FoodRepository)) },
    { provide: DeleteFoodUseCase, useFactory: () => new DeleteFoodUseCase(inject(FoodRepository)) },
  ]);
}
