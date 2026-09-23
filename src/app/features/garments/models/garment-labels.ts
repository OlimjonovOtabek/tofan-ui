import { TranslationKey } from '@core/i18n/dictionary';
import { SelectOption, toSelectOptions } from '@shared/models/select-option';
import { GARMENT_SIZES, GarmentSize } from './garment-catalog';
import { AssignableGarmentStatus, GARMENT_STATUSES, GarmentStatus } from './garment-status';

export type GarmentStatusSeverity = 'secondary' | 'success' | 'warn' | 'danger';

export const GARMENT_STATUS_LABELS: Record<GarmentStatus, TranslationKey> = {
  inactive: 'garments.status.inactive',
  active: 'garments.status.active',
  hidden: 'garments.status.hidden',
  revoked: 'garments.status.revoked',
};

export const GARMENT_STATUS_SEVERITIES: Record<GarmentStatus, GarmentStatusSeverity> = {
  inactive: 'secondary',
  active: 'success',
  hidden: 'warn',
  revoked: 'danger',
};

export interface GarmentStatusAction {
  readonly label: TranslationKey;
  readonly severity: 'secondary' | 'danger';
  readonly icon: string;
  readonly done: TranslationKey;
  readonly warning: TranslationKey | null;
}

export const GARMENT_STATUS_ACTIONS: Record<AssignableGarmentStatus, GarmentStatusAction> = {
  active: {
    label: 'garments.actions.active.label',
    severity: 'secondary',
    icon: 'pi pi-replay',
    done: 'garments.actions.active.done',
    warning: null,
  },
  hidden: {
    label: 'garments.actions.hidden.label',
    severity: 'secondary',
    icon: 'pi pi-eye-slash',
    done: 'garments.actions.hidden.done',
    warning: 'garments.actions.hidden.warning',
  },
  revoked: {
    label: 'garments.actions.revoked.label',
    severity: 'danger',
    icon: 'pi pi-ban',
    done: 'garments.actions.revoked.done',
    warning: 'garments.actions.revoked.warning',
  },
};

export const GARMENT_STATUS_OPTIONS = toSelectOptions(GARMENT_STATUSES, GARMENT_STATUS_LABELS);

export const GARMENT_SIZE_OPTIONS: readonly SelectOption<GarmentSize>[] = GARMENT_SIZES.map(
  (size) => ({ value: size, label: size }),
);
