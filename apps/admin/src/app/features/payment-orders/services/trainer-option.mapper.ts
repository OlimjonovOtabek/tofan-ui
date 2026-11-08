import { TrainerOption } from '../models/trainer-option';
import { TrainerOptionResponse } from './trainer-option.dto';

export function toTrainerOption(response: TrainerOptionResponse): TrainerOption {
  return {
    id: response.id,
    displayName: response.displayName,
    standardPrice: response.monthlyPrice,
  };
}
