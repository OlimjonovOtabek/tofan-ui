import { TranslationParams } from './dictionary';

export function lookupText(tree: object, key: string): string | undefined {
  let node: unknown = tree;
  for (const segment of key.split('.')) {
    if (typeof node !== 'object' || node === null || !(segment in node)) {
      return undefined;
    }
    node = (node as Record<string, unknown>)[segment];
  }
  return typeof node === 'string' ? node : undefined;
}

export function interpolate(text: string, params: TranslationParams): string {
  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  );
}
