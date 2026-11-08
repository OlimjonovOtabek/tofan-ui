import { TestBed } from '@angular/core/testing';
import { LayoutConfig, LayoutService } from './layout.service';
import { readStoredLayoutConfig, storeLayoutConfig, toLayoutConfig } from './layout-config.storage';

const STORAGE_KEY = 'tofan.admin.layout';

const defaults: LayoutConfig = {
  preset: 'Aura',
  primary: 'blue',
  surface: null,
  darkTheme: false,
  menuMode: 'static',
};

const customized: LayoutConfig = {
  preset: 'Nora',
  primary: 'emerald',
  surface: 'zinc',
  darkTheme: true,
  menuMode: 'overlay',
};

describe('layout config storage', () => {
  beforeEach(() => localStorage.clear());

  it('should return the defaults when nothing is stored', () => {
    expect(readStoredLayoutConfig(defaults)).toEqual(defaults);
  });

  it('should restore the stored config when every field is valid', () => {
    storeLayoutConfig(customized);
    expect(readStoredLayoutConfig(defaults)).toEqual(customized);
  });

  it('should return the defaults when the stored value is not JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{broken');
    expect(readStoredLayoutConfig(defaults)).toEqual(defaults);
  });

  it('should return the defaults when the stored value is not an object', () => {
    expect(toLayoutConfig([1, 2], defaults)).toEqual(defaults);
    expect(toLayoutConfig('Nora', defaults)).toEqual(defaults);
    expect(toLayoutConfig(null, defaults)).toEqual(defaults);
  });

  it('should keep the valid fields and default the unknown ones when the stored value is partly invalid', () => {
    const stored = {
      preset: 'Material',
      primary: 'emerald',
      surface: 'plaid',
      darkTheme: 'yes',
      menuMode: 'overlay',
    };
    expect(toLayoutConfig(stored, defaults)).toEqual({
      ...defaults,
      primary: 'emerald',
      menuMode: 'overlay',
    });
  });

  it('should keep the automatic surface when the stored surface is null', () => {
    expect(toLayoutConfig({ ...customized, surface: null }, defaults).surface).toBeNull();
  });
});

describe('LayoutService persistence', () => {
  beforeEach(() => localStorage.clear());

  it('should start from the stored config when one is saved', () => {
    storeLayoutConfig(customized);
    expect(TestBed.inject(LayoutService).layoutConfig()).toEqual(customized);
  });

  it('should save the config when it changes', () => {
    const service = TestBed.inject(LayoutService);

    service.updateConfig({ primary: 'violet', preset: 'Lara' });
    TestBed.tick();

    expect(readStoredLayoutConfig(defaults)).toEqual({
      ...defaults,
      primary: 'violet',
      preset: 'Lara',
    });
  });
});
