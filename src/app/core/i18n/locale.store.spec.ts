import { TestBed } from '@angular/core/testing';
import { LocaleStore } from './locale.store';
import { DOCUMENT } from '@angular/common';

describe('LocaleStore', () => {
  let store: LocaleStore;
  let document: Document;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(LocaleStore);
    document = TestBed.inject(DOCUMENT);
  });

  it('should start with default locale (uz)', () => {
    expect(store.locale()).toBe('uz');
    expect(store.isUz()).toBe(true);
  });

  it('should load locale from localStorage if available', () => {
    localStorage.setItem('tofan_locale', 'ru');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const store2 = TestBed.inject(LocaleStore);
    expect(store2.locale()).toBe('ru');
  });

  it('should fallback to uz if localStorage has invalid locale', () => {
    localStorage.setItem('tofan_locale', 'fr');
    const store2 = TestBed.inject(LocaleStore);
    expect(store2.locale()).toBe('uz');
  });

  it('should update locale and save to localStorage on change', () => {
    store.setLocale('en');
    expect(store.locale()).toBe('en');
    TestBed.flushEffects(); // to run the effect
    expect(localStorage.getItem('tofan_locale')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
