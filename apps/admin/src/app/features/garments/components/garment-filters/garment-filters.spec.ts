import { TestBed } from '@angular/core/testing';
import { GarmentFilter } from '../../models/garment-filter';
import { GarmentFilters } from './garment-filters';

const SEARCH_DEBOUNCE_MS = 400;
const OWNER_ID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';

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

  it('should leave the owner out when the id is not a UUID', () => {
    const { emitted, type } = render();

    type('#filterOwnerId', 'not-a-uuid');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    type('#filterOwnerId', OWNER_ID);
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{}, { ownerId: OWNER_ID }]);
  });
});
