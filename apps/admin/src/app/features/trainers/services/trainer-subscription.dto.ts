import { TierDto } from '@shared/models/tier.dto';

export interface TrainerSubscriptionResponse {
  id: string;
  trainerId: string;
  trainerDisplayName: string;
  userId: string;
  startsOnUtc: string;
  endsOnUtc: string;
  endedOnUtc: string | null;
  grantedBy: string;
  createdOnUtc: string;
  tier: TierDto;
  isPaid: boolean;
  userFullName: string | null;
  userName: string | null;
}

export interface GrantTrainerSubscriptionRequest {
  userId: string;
  months: number;
}

export interface ChangeTrainerSubscriptionTierRequest {
  tier: TierDto;
}
