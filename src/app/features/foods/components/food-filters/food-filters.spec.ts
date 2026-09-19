import { TestBed } from '@angular/core/testing';
import { FoodFilter } from '../../models/food-filter';
import { FoodFilters } from './food-filters';

const SEARCH_DEBOUNCE_MS = 400;

describe('FoodFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should keep asking for active foods when only the search changes', () => {
    const fixture = TestBed.createComponent(FoodFilters);
    const emitted: FoodFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((filter) => emitted.push(filter));
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#search');
    if (input === null) {
      throw new Error('The search input is missing.');
    }

    input.value = ' plov ';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ isActive: true, search: 'plov' }]);
  });
});
