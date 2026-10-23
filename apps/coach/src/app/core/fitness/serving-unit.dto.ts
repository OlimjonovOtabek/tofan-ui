import { enumMap } from '@shared/utils/enum-map';
import { ServingUnit } from './serving-unit';

export enum ServingUnitDto {
  Grams = 1,
  Milliliters = 2,
  Piece = 3,
  Slice = 4,
  Cup = 5,
  Tablespoon = 6,
  Teaspoon = 7,
}

export const servingUnits = enumMap<ServingUnit, ServingUnitDto>(ServingUnitDto);
