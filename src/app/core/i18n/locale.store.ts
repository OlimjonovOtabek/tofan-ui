import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import { AppLocale, DEFAULT_LOCALE, isAppLocale } from './locale';

const LOCALE_STORAGE_KEY = 'tofan.locale';

@Injectable({ providedIn: 'root' })
export class LocaleStore {
  private readonly document = inject(DOCUMENT);

  readonly locale = signal<AppLocale>(readStoredLocale());

  constructor() {
    effect(() => {
      const locale = this.locale();
      this.document.documentElement.lang = locale;
      storeLocale(locale);
    });
  }

  setLocale(locale: AppLocale): void {
    this.locale.set(locale);
  }
}

function readStoredLocale(): AppLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isAppLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function storeLocale(locale: AppLocale): boolean {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    return true;
  } catch {
    return false;
  }
}
