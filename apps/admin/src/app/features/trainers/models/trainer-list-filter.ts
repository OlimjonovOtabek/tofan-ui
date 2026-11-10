import { TrainerPublishState } from './trainer';

export interface TrainerListFilter {
  readonly search?: string;
  readonly publishState?: TrainerPublishState;
}
