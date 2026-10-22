import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { AppLocale } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { LOCALES_BY_ROUTE_ORDER, LOCALE_PATHS } from './locale-paths';

export function activateLocale(locale: AppLocale): ResolveFn<AppLocale> {
  return () => {
    inject(LocaleStore).setLocale(locale);
    return locale;
  };
}

export function localeRoutes(children: () => Routes): Routes {
  return LOCALES_BY_ROUTE_ORDER.map((locale) => ({
    path: LOCALE_PATHS[locale],
    resolve: { locale: activateLocale(locale) },
    children: children(),
  }));
}
