/**
 * A record that points at a stored file. The backend deletes a file without looking for these,
 * so the panel finds them first: a deleted exercise video leaves a broken player in the app.
 */
export interface FileUsage {
  readonly kind: 'exerciseVideo';
  readonly ownerId: string;
  readonly ownerName: string;
}
