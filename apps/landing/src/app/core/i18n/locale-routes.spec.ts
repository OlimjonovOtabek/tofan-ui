import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { LocaleStore } from '@core/i18n/locale.store';
import { localeRoutes } from './locale-routes';

@Component({ template: '' })
class EmptyPage {}

describe('localeRoutes', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(localeRoutes(() => [{ path: '', component: EmptyPage }]))],
    });
  });

  it('should list the prefixed locales before the default one when routes are built', () => {
    const paths = localeRoutes(() => []).map((route) => route.path);

    expect(paths).toEqual(['ru', 'en', '']);
  });

  it('should switch to the locale of the path when a localized page opens', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/ru');

    expect(TestBed.inject(LocaleStore).locale()).toBe('ru');
  });

  it('should switch to Uzbek when the root page opens', async () => {
    TestBed.inject(LocaleStore).setLocale('en');
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/');

    expect(TestBed.inject(LocaleStore).locale()).toBe('uz');
  });
});
