const UNITS = ['B', 'KB', 'MB', 'GB'];
const STEP = 1024;

/** `48 MB`, `1.4 MB`, `512 KB`: one decimal below 10, none above, as file managers do. */
export function formatFileSize(bytes: number): string {
  let value = bytes;
  let unit = 0;
  while (value >= STEP && unit < UNITS.length - 1) {
    value /= STEP;
    unit++;
  }
  const rounded = unit === 0 || value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${UNITS[unit]}`;
}
