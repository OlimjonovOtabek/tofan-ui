import { SelectOption, toSelectOptions } from '@shared/models/select-option';
import { ACCOUNT_ROLE_FILTERS, AccountRoleFilter } from './account-filter';

export const ACCOUNT_ROLE_LABELS: Record<AccountRoleFilter, string> = {
  admin: 'Faqat adminlar',
};

export const ACCOUNT_STATUS_OPTIONS: SelectOption<boolean>[] = [
  { value: true, label: 'Faol' },
  { value: false, label: 'Bloklangan' },
];

export const ACCOUNT_ROLE_OPTIONS = toSelectOptions(ACCOUNT_ROLE_FILTERS, ACCOUNT_ROLE_LABELS);
