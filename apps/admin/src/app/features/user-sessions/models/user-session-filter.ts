export const SESSION_STATUS_FILTERS = ['active', 'revoked', 'expired'] as const;
export type SessionStatusFilter = (typeof SESSION_STATUS_FILTERS)[number];

export interface SessionListFilter {
  readonly search?: string;
  readonly status?: SessionStatusFilter;
  readonly loggedInFrom?: Date;
  readonly loggedInBefore?: Date;
}

export interface UserSessionFilter extends SessionListFilter {
  readonly userId?: string;
}
