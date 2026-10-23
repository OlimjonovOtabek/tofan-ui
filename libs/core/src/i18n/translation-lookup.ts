import { TranslationParams } from './dictionary';

const PLURAL_HEAD = /\{(\w+),\s*plural,/g;
const OPTION_KEY = /\s*(=\d+|zero|one|two|few|many|other)\s*\{/y;
const OTHER = 'other';
const DEFAULT_PLURAL_LOCALE = 'en-GB';

interface PluralBlock {
  readonly start: number;
  readonly end: number;
  readonly name: string;
  readonly options: ReadonlyMap<string, string>;
}

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

export function interpolate(
  text: string,
  params: TranslationParams,
  pluralLocale: string = DEFAULT_PLURAL_LOCALE,
): string {
  return replacePlaceholders(resolvePlurals(text, params, pluralLocale), params);
}

function replacePlaceholders(text: string, params: TranslationParams): string {
  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  );
}

function resolvePlurals(text: string, params: TranslationParams, locale: string): string {
  let result = '';
  let cursor = 0;
  for (const block of pluralBlocks(text)) {
    const chosen = chooseOption(block, params, locale);
    const resolved =
      chosen === null ? text.slice(block.start, block.end) : resolvePlurals(chosen, params, locale);
    result += text.slice(cursor, block.start) + resolved;
    cursor = block.end;
  }
  return result + text.slice(cursor);
}

function chooseOption(
  block: PluralBlock,
  params: TranslationParams,
  locale: string,
): string | null {
  const count = params[block.name];
  if (typeof count !== 'number') {
    return null;
  }
  const category = new Intl.PluralRules(locale).select(count);
  return (
    block.options.get(`=${count}`) ?? block.options.get(category) ?? block.options.get(OTHER) ?? ''
  );
}

function pluralBlocks(text: string): PluralBlock[] {
  const blocks: PluralBlock[] = [];
  for (const head of text.matchAll(PLURAL_HEAD)) {
    const block = readBlock(text, head.index, head.index + head[0].length, head[1]);
    if (block !== null && (blocks.at(-1)?.end ?? 0) <= block.start) {
      blocks.push(block);
    }
  }
  return blocks;
}

function readBlock(
  text: string,
  start: number,
  bodyStart: number,
  name: string,
): PluralBlock | null {
  const options = new Map<string, string>();
  let cursor = bodyStart;
  for (;;) {
    OPTION_KEY.lastIndex = cursor;
    const key = OPTION_KEY.exec(text);
    if (key === null) {
      break;
    }
    const close = closingBrace(text, OPTION_KEY.lastIndex);
    if (close < 0) {
      return null;
    }
    options.set(key[1], text.slice(OPTION_KEY.lastIndex, close));
    cursor = close + 1;
  }
  const end = text.indexOf('}', cursor);
  return end < 0 || options.size === 0 ? null : { start, end: end + 1, name, options };
}

function closingBrace(text: string, from: number): number {
  let depth = 1;
  for (let index = from; index < text.length; index++) {
    if (text[index] === '{') {
      depth++;
    } else if (text[index] === '}' && --depth === 0) {
      return index;
    }
  }
  return -1;
}
