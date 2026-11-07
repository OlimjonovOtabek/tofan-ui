export const TIERS = ['standard', 'vip'] as const;
export type Tier = (typeof TIERS)[number];
