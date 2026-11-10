import { TestBed } from '@angular/core/testing';
import { LayoutService } from './layout.service';

function stubViewport(desktop: boolean): void {
  const query: Pick<MediaQueryList, 'matches' | 'addEventListener'> = {
    matches: desktop,
    addEventListener: () => undefined,
  };
  vi.stubGlobal('matchMedia', () => query);
}

describe('LayoutService', () => {
  beforeEach(() => localStorage.clear());

  afterEach(() => vi.unstubAllGlobals());

  it('should collapse the menu to a rail when the menu is toggled on a desktop', () => {
    stubViewport(true);
    const service = TestBed.inject(LayoutService);

    service.toggleMenu();

    expect(service.isRailMenu()).toBe(true);
    expect(service.layoutConfig().menuCollapsed).toBe(true);
    expect(service.isSidebarActive()).toBe(false);
  });

  it('should open the drawer instead of the rail when the menu is toggled on a small screen', () => {
    stubViewport(false);
    const service = TestBed.inject(LayoutService);

    service.toggleMenu();

    expect(service.isSidebarActive()).toBe(true);
    expect(service.isRailMenu()).toBe(false);
  });

  it('should close the drawer when the menu is hidden', () => {
    stubViewport(false);
    const service = TestBed.inject(LayoutService);
    service.toggleMenu();

    service.hideMenu();

    expect(service.isSidebarActive()).toBe(false);
  });

  it('should leave the card color to the theme when no card color is chosen', () => {
    stubViewport(true);
    expect(TestBed.inject(LayoutService).cardBackground()).toBeNull();
  });

  it('should tint the main card when a card color is chosen', () => {
    stubViewport(true);
    const service = TestBed.inject(LayoutService);

    service.updateConfig({ card: 'blue' });

    expect(service.cardBackground()).toBe('color-mix(in srgb, #e0e7f5, #ffffff 55%)');
  });

  it('should mark the ground as strong when a strong background is chosen in light mode', () => {
    stubViewport(true);
    const service = TestBed.inject(LayoutService);

    service.updateConfig({ ground: 'strong-indigo' });

    expect(service.isStrongGround()).toBe(true);
  });

  it('should not mark the ground as strong when the theme is dark', () => {
    stubViewport(true);
    const service = TestBed.inject(LayoutService);

    service.updateConfig({ ground: 'strong-indigo', darkTheme: true });

    expect(service.isStrongGround()).toBe(false);
  });

  it('should soften the card when the card is matte', () => {
    stubViewport(true);
    const service = TestBed.inject(LayoutService);

    service.updateConfig({ card: 'strong-blue', cardMatte: true });

    expect(service.cardBackground()).toBe('oklch(from #dbeafe l calc(c * 0.4) h)');
  });
});
