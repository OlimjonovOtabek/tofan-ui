export type ExternalLink = string | null;

export const EXTERNAL_LINKS = {
  appStore: 'https://apps.apple.com/uz/app/tofan-workout/id6762252445',
  googlePlay: 'https://play.google.com/store/apps/details?id=com.peaktofan.tofan_tracker',
  adminTelegram: 'https://t.me/peaktofan_admin',
  coachPanel: 'https://coach.peaktofan.com/',
  apparelShop: null,
  telegram: null,
  instagram: null,
  youtube: null,
  privacyPolicy: null,
  termsOfUse: null,
  refundPolicy: null,
} as const satisfies Record<string, ExternalLink>;
