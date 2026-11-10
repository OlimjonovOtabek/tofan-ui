import {
  Attachment,
  albumRows,
  fileBadge,
  formatDuration,
  imageAspect,
  isUrlFresh,
  keepFreshUrls,
  urlExpiresAt,
  waveformBars,
} from './chat-attachment';

const attachment = (fileId: string, change: Partial<Attachment> = {}): Attachment => ({
  fileId,
  url: `/api/files/${fileId}/content`,
  fileName: 'photo.jpg',
  contentType: 'image/jpeg',
  sizeBytes: 1,
  durationSeconds: null,
  width: null,
  height: null,
  waveform: [],
  ...change,
});

describe('albumRows', () => {
  it('should lay out the album like a messenger grid when the count changes', () => {
    const sizes = (count: number) =>
      albumRows(Array.from({ length: count }, (_, index) => attachment(`f${index}`))).map(
        (row) => row.length,
      );

    expect(sizes(1)).toEqual([1]);
    expect(sizes(3)).toEqual([1, 2]);
    expect(sizes(5)).toEqual([2, 3]);
    expect(sizes(10)).toEqual([2, 2, 3, 3]);
  });

  it('should keep the order and the gallery index of every tile', () => {
    const rows = albumRows([attachment('a'), attachment('b'), attachment('c')]);

    expect(rows.flat().map((tile) => [tile.attachment.fileId, tile.index])).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 2],
    ]);
  });
});

describe('imageAspect', () => {
  it('should use the measured size and clamp extreme shapes', () => {
    expect(imageAspect(attachment('a', { width: 800, height: 600 }))).toBeCloseTo(4 / 3);
    expect(imageAspect(attachment('a', { width: 100, height: 1000 }))).toBe(0.5);
    expect(imageAspect(attachment('a', { width: 3000, height: 500 }))).toBe(2);
  });

  it('should fall back to four by three when the size is unknown', () => {
    expect(imageAspect(attachment('a'))).toBeCloseTo(4 / 3);
  });
});

describe('file and time labels', () => {
  it('should show the extension as the badge', () => {
    expect(fileBadge('plan.pdf')).toBe('PDF');
    expect(fileBadge('table.xlsx')).toBe('XLSX');
    expect(fileBadge('README')).toBe('');
  });

  it('should format seconds as minutes and seconds', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(10.7)).toBe('0:10');
    expect(formatDuration(905)).toBe('15:05');
  });
});

describe('waveformBars', () => {
  it('should always give sixty four bars within zero and one hundred', () => {
    const bars = waveformBars([50, 120, -5]);

    expect(bars).toHaveLength(64);
    expect(Math.max(...bars)).toBe(100);
    expect(Math.min(...bars)).toBe(0);
    expect(waveformBars([])).toEqual(Array.from({ length: 64 }, () => 0));
  });
});

describe('signed urls', () => {
  const now = new Date('2026-11-09T10:00:00Z');
  const at = (offsetSeconds: number) =>
    `/api/files/f/content?expires=${now.getTime() / 1000 + offsetSeconds}&signature=abc`;

  it('should read the expiry from the url', () => {
    expect(urlExpiresAt(at(0))).toEqual(now);
    expect(urlExpiresAt('/api/files/f/content')).toBeNull();
  });

  it('should treat a url as fresh only when it outlives the safety margin', () => {
    expect(isUrlFresh(at(3600), now)).toBe(true);
    expect(isUrlFresh(at(30), now)).toBe(false);
    expect(isUrlFresh('/api/files/f/content', now)).toBe(true);
  });

  it('should keep the known url per file id while it is fresh', () => {
    const kept = keepFreshUrls(
      [attachment('a', { url: at(7200) }), attachment('b', { url: at(7200) })],
      [attachment('a', { url: at(3600) }), attachment('b', { url: at(10) })],
      now,
    );

    expect(kept.map((item) => item.url)).toEqual([at(3600), at(7200)]);
  });
});
