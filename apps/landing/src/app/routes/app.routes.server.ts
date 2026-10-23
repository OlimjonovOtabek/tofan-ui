import { RenderMode, ServerRoute } from '@angular/ssr';
import { APP_LOCALES } from '@core/i18n/locale';
import { LOCALE_PATHS } from '@landing/core/i18n/locale-paths';

const NOT_FOUND_STATUS = 404;

const prerenderedHomes: ServerRoute[] = APP_LOCALES.map((locale) => ({
  path: LOCALE_PATHS[locale],
  renderMode: RenderMode.Prerender,
}));

export const serverRoutes: ServerRoute[] = [
  ...prerenderedHomes,
  { path: '**', renderMode: RenderMode.Server, status: NOT_FOUND_STATUS },
];
