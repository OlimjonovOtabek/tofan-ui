import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AppLocale, DEFAULT_LOCALE, LOCALES } from './locale';

const LOCALE_STORAGE_KEY = 'tofan_locale';

@Injectable({ providedIn: 'root' })
export class LocaleStore {
  private readonly document = inject(DOCUMENT);

  readonly locale = signal<AppLocale>(this.loadInitialLocale());
  
  readonly isUz = computed(() => this.locale() === 'uz');
  readonly isRu = computed(() => this.locale() === 'ru');
  readonly isEn = computed(() => this.locale() === 'en');

  constructor() {
    effect(() => {
      const current = this.locale();
      this.document.documentElement.lang = current;
      this.saveLocale(current);
    });
  }

  setLocale(locale: AppLocale): void {
    this.locale.set(locale);
  }

  private loadInitialLocale(): AppLocale {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored && LOCALES.includes(stored as AppLocale)) {
        return stored as AppLocale;
      }
    } catch (e) { console.warn(e); }
    return DEFAULT_LOCALE;
  }

  private saveLocale(locale: AppLocale): void {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch (e) { console.warn(e); }
  }
}
