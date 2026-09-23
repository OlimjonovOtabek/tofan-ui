export const GARMENT_STATUSES = ['inactive', 'active', 'hidden', 'revoked'] as const;
export type GarmentStatus = (typeof GARMENT_STATUSES)[number];

export const ASSIGNABLE_GARMENT_STATUSES = ['active', 'hidden', 'revoked'] as const;
export type AssignableGarmentStatus = (typeof ASSIGNABLE_GARMENT_STATUSES)[number];
