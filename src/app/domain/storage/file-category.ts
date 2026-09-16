/** File kinds the Storage module accepts; the wire format (an integer) stays in infrastructure. */
export const FILE_CATEGORIES = [
  'exerciseVideo',
  'exerciseThumbnail',
  'avatar',
  'foodImage',
  'productImage',
  'document',
] as const;
export type FileCategory = (typeof FILE_CATEGORIES)[number];
