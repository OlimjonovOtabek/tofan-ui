/** File kinds the Storage module accepts; the wire format (an integer) stays in infrastructure. */
export type FileCategory =
  | 'exerciseVideo'
  | 'exerciseThumbnail'
  | 'avatar'
  | 'foodImage'
  | 'productImage'
  | 'document';
