import { TranslationKey } from '@core/i18n/dictionary';
import { Tier } from '@shared/models/tier';

export type SubscriptionTierSeverity = 'secondary' | 'warn';

export const SUBSCRIPTION_TIER_SEVERITIES: Record<Tier, SubscriptionTierSeverity> = {
  standard: 'secondary',
  vip: 'warn',
};

export const TIER_CHANGE_ACTION_LABELS: Record<Tier, TranslationKey> = {
  standard: 'trainers.subscriptions.actions.makeStandard',
  vip: 'trainers.subscriptions.actions.makeVip',
};

export const TIER_CHANGE_ICONS: Record<Tier, string> = {
  standard: 'pi pi-arrow-down',
  vip: 'pi pi-crown',
};

export const TIER_CHANGE_CONFIRMATIONS: Record<Tier, TranslationKey> = {
  standard: 'trainers.subscriptions.confirmMakeStandard',
  vip: 'trainers.subscriptions.confirmMakeVip',
};

export const TIER_CHANGE_TOASTS: Record<Tier, TranslationKey> = {
  standard: 'trainers.toast.tierChangedToStandard',
  vip: 'trainers.toast.tierChangedToVip',
};
