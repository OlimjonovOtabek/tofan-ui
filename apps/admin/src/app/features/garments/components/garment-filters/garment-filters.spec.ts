import { TestBed } from '@angular/core/testing';
import { GarmentFilter } from '../../models/garment-filter';
import { GarmentFilters } from './garment-filters';

const SEARCH_DEBOUNCE_MS = 400;

describe('GarmentFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function render(): { emitted: GarmentFilter[]; type: (id: string, text: string) => void } {
    const fixture = TestBed.createComponent(GarmentFilters);
    const emitted: GarmentFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((filter) => emitted.push(filter));
    fixture.detectChanges();
    const type = (id: string, text: string): void => {
      const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(id);
      if (input === null) {
        throw new Error(`The input ${id} is missing.`);
      }
      input.value = text;
      input.dispatchEvent(new Event('input'));
      TestBed.tick();
    };
    return { emitted, type };
  }

  it('should emit the trimmed serial number once when typing settles', () => {
    const { emitted, type } = render();

    type('#filterSerialNumber', ' PT');
    type('#filterSerialNumber', ' 01K7 ');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ serialNumber: '01K7' }]);
  });

  it('should search the owner by name when an owner name is typed', () => {
    const { emitted, type } = render();

    type('#filterOwnerSearch', ' otabek ');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ ownerSearch: 'otabek' }]);
  });
});
