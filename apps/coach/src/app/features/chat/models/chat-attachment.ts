export const MESSAGE_KINDS = ['text', 'image', 'file', 'voice', 'videoNote'] as const;
export type MessageKind = (typeof MESSAGE_KINDS)[number];

export const MAX_ATTACHMENTS = 10;
export const WAVEFORM_BARS = 64;

const WAVEFORM_MAX = 100;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const URL_SAFETY_MARGIN_MS = 60_000;
const BADGE_MAX_LENGTH = 4;
const MIN_ASPECT = 0.5;
const MAX_ASPECT = 2;
const DEFAULT_ASPECT = 4 / 3;

const ALBUM_ROWS: Readonly<Record<number, readonly number[]>> = {
  1: [1],
  2: [2],
  3: [1, 2],
  4: [2, 2],
  5: [2, 3],
  6: [3, 3],
  7: [2, 2, 3],
  8: [2, 3, 3],
  9: [3, 3, 3],
  10: [2, 2, 3, 3],
};

export interface Attachment {
  readonly fileId: string;
  readonly url: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly durationSeconds: number | null;
  readonly width: number | null;
  readonly height: number | null;
  readonly waveform: readonly number[];
}

export interface AlbumTile {
  readonly attachment: Attachment;
  readonly index: number;
}

export function albumRows(attachments: readonly Attachment[]): AlbumTile[][] {
  const sizes = ALBUM_ROWS[Math.min(attachments.length, MAX_ATTACHMENTS)] ?? [];
  const rows: AlbumTile[][] = [];
  let next = 0;
  for (const size of sizes) {
    rows.push(
      attachments.slice(next, next + size).map((attachment, offset) => ({
        attachment,
        index: next + offset,
      })),
    );
    next += size;
  }
  return rows;
}

export function imageAspect(attachment: Attachment): number {
  if (attachment.width === null || attachment.height === null || attachment.height === 0) {
    return DEFAULT_ASPECT;
  }
  return Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, attachment.width / attachment.height));
}

export function fileBadge(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  const extension = dot === -1 ? '' : fileName.slice(dot + 1);
  return extension.slice(0, BADGE_MAX_LENGTH).toUpperCase();
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const rest = seconds % SECONDS_PER_MINUTE;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export function waveformBars(values: readonly number[]): number[] {
  if (values.length === 0) {
    return Array.from({ length: WAVEFORM_BARS }, () => 0);
  }
  return Array.from({ length: WAVEFORM_BARS }, (_, bar) => {
    const value = values[Math.floor((bar * values.length) / WAVEFORM_BARS)] ?? 0;
    return Math.min(WAVEFORM_MAX, Math.max(0, value));
  });
}

export function urlExpiresAt(url: string): Date | null {
  const query = url.indexOf('?');
  if (query === -1) {
    return null;
  }
  const expires = Number(new URLSearchParams(url.slice(query + 1)).get('expires'));
  return Number.isFinite(expires) && expires > 0
    ? new Date(expires * MILLISECONDS_PER_SECOND)
    : null;
}

export function isUrlFresh(url: string, now: Date): boolean {
  const expires = urlExpiresAt(url);
  return expires === null || expires.getTime() - URL_SAFETY_MARGIN_MS > now.getTime();
}

export function keepFreshUrls(
  incoming: readonly Attachment[],
  shown: readonly Attachment[],
  now: Date,
): readonly Attachment[] {
  if (shown.length === 0) {
    return incoming;
  }
  const known = new Map(shown.map((attachment) => [attachment.fileId, attachment.url]));
  return incoming.map((attachment) => {
    const url = known.get(attachment.fileId);
    return url !== undefined && url !== attachment.url && isUrlFresh(url, now)
      ? { ...attachment, url }
      : attachment;
  });
}
