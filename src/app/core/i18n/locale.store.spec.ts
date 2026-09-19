import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LocaleStore } from './locale.store';

const STORAGE_KEY = 'tofan.locale';

describe('LocaleStore', () => {
  beforeEach(() => localStorage.clear());

  it('should start in Uzbek when nothing is stored', () => {
    expect(TestBed.inject(LocaleStore).locale()).toBe('uz');
  });

  it('should restore the stored locale when it is supported', () => {
    localStorage.setItem(STORAGE_KEY, 'ru');
    expect(TestBed.inject(LocaleStore).locale()).toBe('ru');
  });

  it('should ignore the stored value when it is not a supported locale', () => {
    localStorage.setItem(STORAGE_KEY, 'fr');
    expect(TestBed.inject(LocaleStore).locale()).toBe('uz');
  });

  it('should remember the locale and set the page language when it changes', () => {
    const store = TestBed.inject(LocaleStore);

    store.setLocale('en');
    TestBed.tick();

    expect(localStorage.getItem(STORAGE_KEY)).toBe('en');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
  });
});
