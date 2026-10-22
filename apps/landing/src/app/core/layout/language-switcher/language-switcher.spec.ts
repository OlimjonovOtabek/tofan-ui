import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LocaleStore } from '@core/i18n/locale.store';
import { LanguageSwitcher } from './language-switcher';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(LanguageSwitcher);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show the current locale code when rendered', () => {
    TestBed.inject(LocaleStore).setLocale('ru');

    expect(render().querySelector('.trigger')?.textContent?.trim()).toBe('RU');
  });

  it('should list a link per locale when the trigger is clicked', () => {
    const element = render();

    element.querySelector<HTMLButtonElement>('.trigger')?.click();
    TestBed.tick();

    const links = [...element.querySelectorAll('#language-menu a')].map((link) =>
      link.getAttribute('href'),
    );
    expect(links).toEqual(['/', '/ru', '/en']);
    expect(element.querySelector('[aria-current="page"]')?.getAttribute('lang')).toBe('uz');
  });

  it('should close the menu when the user clicks outside it', () => {
    const element = render();
    element.querySelector<HTMLButtonElement>('.trigger')?.click();
    TestBed.tick();

    document.body.click();
    TestBed.tick();

    expect(element.querySelector('#language-menu')).toBeNull();
  });
});
