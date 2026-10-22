import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiteNav } from './site-nav';

describe('SiteNav', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(SiteNav);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should link every section to the home page anchor when rendered', () => {
    const hrefs = [...render().querySelectorAll('.links a')].map((link) =>
      link.getAttribute('href'),
    );

    expect(hrefs).toEqual(['/#features', '/#apparel', '/#coaches', '/#faq']);
  });

  it('should open the mobile menu when the menu button is clicked', () => {
    const element = render();

    element.querySelector<HTMLButtonElement>('.menu-toggle')?.click();
    TestBed.tick();

    expect(element.querySelector('#mobile-menu')).not.toBeNull();
    expect(element.querySelector('.menu-toggle')?.getAttribute('aria-expanded')).toBe('true');
  });

  it('should close the mobile menu when a menu link is chosen', () => {
    const element = render();
    element.querySelector<HTMLButtonElement>('.menu-toggle')?.click();
    TestBed.tick();

    element.querySelector<HTMLAnchorElement>('.mobile-link')?.click();
    TestBed.tick();

    expect(element.querySelector('#mobile-menu')).toBeNull();
  });
});
