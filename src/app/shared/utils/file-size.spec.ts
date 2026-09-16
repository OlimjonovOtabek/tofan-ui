import { formatFileSize } from './file-size';

describe('formatFileSize', () => {
  it('picks the largest unit that keeps the number readable', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(48 * 1024 * 1024)).toBe('48 MB');
    expect(formatFileSize(Math.round(1.44 * 1024 * 1024))).toBe('1.4 MB');
    expect(formatFileSize(3 * 1024 ** 4)).toBe('3072 GB');
  });
});
