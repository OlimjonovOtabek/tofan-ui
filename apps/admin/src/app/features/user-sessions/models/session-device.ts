export type SessionDeviceKind = 'app' | 'browser' | 'other' | 'unknown';

export interface SessionDevice {
  readonly kind: SessionDeviceKind;
  readonly name: string | null;
}

const TOFAN_APP = /^Tofan\/(\S+)\s*\(([^;)]+);\s*([^)]+)\)/;
const DART_CLIENT = /^Dart\//;
const BROWSERS: readonly (readonly [RegExp, string])[] = [
  [/Edg(?:e|A|iOS)?\/[\d.]+/, 'Edge'],
  [/OPR\/[\d.]+/, 'Opera'],
  [/YaBrowser\/[\d.]+/, 'Yandex'],
  [/Firefox\/[\d.]+|FxiOS\/[\d.]+/, 'Firefox'],
  [/Chrome\/[\d.]+|CriOS\/[\d.]+/, 'Chrome'],
  [/Version\/[\d.]+.*Safari\//, 'Safari'],
];
const SYSTEMS: readonly (readonly [RegExp, (match: RegExpMatchArray) => string])[] = [
  [/Android ([\d.]+)/, (match) => `Android ${match[1]}`],
  [/iPhone OS ([\d_]+)/, (match) => `iOS ${match[1].replaceAll('_', '.')}`],
  [/iPad; CPU OS ([\d_]+)/, (match) => `iPadOS ${match[1].replaceAll('_', '.')}`],
  [/Windows NT/, () => 'Windows'],
  [/Mac OS X/, () => 'macOS'],
  [/CrOS/, () => 'ChromeOS'],
  [/Linux/, () => 'Linux'],
];
const PRODUCT_TOKEN = /^[^\s(]+/;

export function toSessionDevice(userAgent: string | null): SessionDevice {
  const agent = userAgent?.trim() ?? '';
  if (agent.length === 0) {
    return { kind: 'unknown', name: null };
  }
  const app = TOFAN_APP.exec(agent);
  if (app !== null) {
    return { kind: 'app', name: `Tofan ${app[1]} · ${app[2].trim()} · ${app[3].trim()}` };
  }
  if (DART_CLIENT.test(agent)) {
    return { kind: 'app', name: null };
  }
  const browser = BROWSERS.find(([pattern]) => pattern.test(agent))?.[1];
  if (browser !== undefined && agent.startsWith('Mozilla/')) {
    const system = systemOf(agent);
    return { kind: 'browser', name: system === null ? browser : `${browser} · ${system}` };
  }
  return { kind: 'other', name: PRODUCT_TOKEN.exec(agent)?.[0] ?? agent };
}

function systemOf(agent: string): string | null {
  for (const [pattern, describe] of SYSTEMS) {
    const match = agent.match(pattern);
    if (match !== null) {
      return describe(match);
    }
  }
  return null;
}
