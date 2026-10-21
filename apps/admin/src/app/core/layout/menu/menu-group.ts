import { TranslationKey } from '@core/i18n/dictionary';
import { APP_MENU } from './app-menu';
import { LayoutMenuItem } from './layout-menu-item';

const DASHBOARD_URL = '/';

export function findMenuGroupLabel(
  url: string,
  menu: readonly LayoutMenuItem[] = APP_MENU,
): TranslationKey | undefined {
  const path = url.split(/[?#]/)[0];
  const group = menu.find((entry) => entry.items?.some((item) => matchesItem(item, path)));
  return group?.label;
}

function matchesItem(item: LayoutMenuItem, path: string): boolean {
  const link = firstSegment(item.routerLink);
  if (typeof link !== 'string') {
    return false;
  }
  if (link === DASHBOARD_URL) {
    return path === DASHBOARD_URL;
  }
  return path === link || path.startsWith(`${link}/`);
}

function firstSegment(routerLink: unknown): unknown {
  return Array.isArray(routerLink) ? (routerLink as unknown[])[0] : undefined;
}
