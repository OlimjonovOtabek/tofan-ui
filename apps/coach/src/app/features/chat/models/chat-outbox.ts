import { ErrorMessage } from '@core/feedback/error-message';
import { FileCategory } from '@shared/models/file-category';

export const OUTGOING_KINDS = ['image', 'file', 'voice', 'videoNote'] as const;
export type OutgoingKind = (typeof OUTGOING_KINDS)[number];

export const OUTGOING_CATEGORIES: Readonly<Record<OutgoingKind, FileCategory>> = {
  image: 'chatImage',
  file: 'chatFile',
  voice: 'chatVoice',
  videoNote: 'chatVideoNote',
};

const PERCENT = 100;

export interface PickedFile {
  readonly id: string;
  readonly file: File;
  readonly previewUrl: string | null;
}

export interface OutgoingDraft {
  readonly kind: OutgoingKind;
  readonly files: readonly PickedFile[];
  readonly caption: string;
  readonly durationSeconds: number | null;
}

export interface PendingMessage extends OutgoingDraft {
  readonly id: string;
  readonly progress: number;
  readonly failure: ErrorMessage | null;
}

export function combinedProgress(sizes: readonly number[], percents: readonly number[]): number {
  const total = sizes.reduce((sum, size) => sum + size, 0);
  if (total === 0) {
    return 0;
  }
  const done = sizes.reduce(
    (sum, size, index) => sum + (size * (percents[index] ?? 0)) / PERCENT,
    0,
  );
  return Math.round((done / total) * PERCENT);
}

const RECORDED_KINDS: readonly OutgoingKind[] = ['voice', 'videoNote'];

export function captionFor(kind: OutgoingKind, caption: string): string {
  return RECORDED_KINDS.includes(kind) ? '' : caption.trim();
}
