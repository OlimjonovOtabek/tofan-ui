export const ACCOUNT_ROLE_FILTERS = ['admin'] as const;
export type AccountRoleFilter = (typeof ACCOUNT_ROLE_FILTERS)[number];

export interface AccountFilter {
  readonly search?: string;
  readonly isActive?: boolean;
  readonly role?: AccountRoleFilter;
}
