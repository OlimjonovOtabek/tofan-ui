import { TranslationKey } from '@core/i18n/dictionary';
import { toSelectOptions } from '@shared/models/select-option';
import { TIERS } from '@shared/models/tier';
import { TIER_LABELS } from '@shared/models/tier-labels';
import { TRAINER_PUBLISH_STATES, TrainerPublishState } from './trainer';
import { SUBSCRIPTION_STATUSES, SubscriptionStatus } from './subscription-status';
import { SubscriptionSource } from './trainer-subscription';

export type TrainerTagSeverity = 'secondary' | 'success';

export const TRAINER_PUBLISH_LABELS: Record<TrainerPublishState, TranslationKey> = {
  published: 'trainers.status.published',
  draft: 'trainers.status.draft',
};

export const TRAINER_PUBLISH_OPTIONS = toSelectOptions(
  TRAINER_PUBLISH_STATES,
  TRAINER_PUBLISH_LABELS,
);

export const TRAINER_PUBLISH_SEVERITIES: Record<TrainerPublishState, TrainerTagSeverity> = {
  published: 'success',
  draft: 'secondary',
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, TranslationKey> = {
  active: 'trainers.subscriptionStatus.active',
  ended: 'trainers.subscriptionStatus.ended',
};

export const SUBSCRIPTION_STATUS_SEVERITIES: Record<SubscriptionStatus, TrainerTagSeverity> = {
  active: 'success',
  ended: 'secondary',
};

export const SUBSCRIPTION_STATUS_OPTIONS = toSelectOptions(
  SUBSCRIPTION_STATUSES,
  SUBSCRIPTION_STATUS_LABELS,
);

export const SUBSCRIPTION_TIER_OPTIONS = toSelectOptions(TIERS, TIER_LABELS);

export const SUBSCRIPTION_SOURCE_LABELS: Record<SubscriptionSource, TranslationKey> = {
  paid: 'trainers.subscriptions.source.paid',
  granted: 'trainers.subscriptions.source.granted',
};

export const SUBSCRIPTION_SOURCE_SEVERITIES: Record<SubscriptionSource, TrainerTagSeverity> = {
  paid: 'success',
  granted: 'secondary',
};
