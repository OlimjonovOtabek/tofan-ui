import { TranslationKey } from '@core/i18n/dictionary';
import { SelectOption, toSelectOptions } from '@shared/models/select-option';
import { ACCOUNT_ROLE_FILTERS, AccountRoleFilter } from './account-filter';

export const ACCOUNT_ROLE_LABELS: Record<AccountRoleFilter, TranslationKey> = {
  admin: 'accounts.roles.admin',
};

export const ACCOUNT_STATUS_OPTIONS: SelectOption<boolean, TranslationKey>[] = [
  { value: true, label: 'accounts.status.active' },
  { value: false, label: 'accounts.status.blocked' },
];

export const ACCOUNT_ROLE_OPTIONS = toSelectOptions(ACCOUNT_ROLE_FILTERS, ACCOUNT_ROLE_LABELS);
