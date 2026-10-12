import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { provideAppTitle } from './app-title.strategy';
import { LocaleStore } from './locale.store';
import { pageTitle } from './page-title';

const APP_NAME = 'Tofan Test';

@Component({ template: '' })
class EmptyPage {}

describe('AppTitleStrategy', () => {
  let router: Router;
  let title: Title;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'saved', title: pageTitle('common.actions.save'), component: EmptyPage },
          { path: 'untitled', component: EmptyPage },
        ]),
        provideAppTitle(APP_NAME),
      ],
    });
    router = TestBed.inject(Router);
    title = TestBed.inject(Title);
  });

  it('should show the translated page title and the app name when the route has a title', async () => {
    await router.navigateByUrl('/saved');
    TestBed.tick();

    expect(title.getTitle()).toBe(`Saqlash | ${APP_NAME}`);
  });

  it('should show only the app name when the route has no title', async () => {
    await router.navigateByUrl('/untitled');
    TestBed.tick();

    expect(title.getTitle()).toBe(APP_NAME);
  });

  it('should retranslate the title when the locale changes', async () => {
    await router.navigateByUrl('/saved');
    TestBed.inject(LocaleStore).setLocale('en');
    TestBed.tick();

    expect(title.getTitle()).toBe(`Save | ${APP_NAME}`);
  });
});
