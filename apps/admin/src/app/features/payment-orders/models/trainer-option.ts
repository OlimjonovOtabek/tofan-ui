export const TRAINER_OPTIONS_LIMIT = 100;

export interface TrainerOption {
  readonly id: string;
  readonly displayName: string;
  readonly standardPrice: number;
}
