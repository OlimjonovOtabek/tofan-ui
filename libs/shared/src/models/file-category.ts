export const FILE_CATEGORIES = [
  'exerciseVideo',
  'exerciseThumbnail',
  'avatar',
  'foodImage',
  'productImage',
  'document',
  'garmentImage',
  'chatImage',
  'chatVoice',
  'chatVideoNote',
  'chatFile',
] as const;
export type FileCategory = (typeof FILE_CATEGORIES)[number];

export const CHAT_FILE_CATEGORIES: readonly FileCategory[] = [
  'chatImage',
  'chatVoice',
  'chatVideoNote',
  'chatFile',
];
