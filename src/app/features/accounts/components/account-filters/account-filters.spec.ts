import { TestBed } from '@angular/core/testing';
import { AccountFilter } from '../../models/account-filter';
import { AccountFilters } from './account-filters';

const SEARCH_DEBOUNCE_MS = 400;

describe('AccountFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should emit the trimmed search once when typing settles', () => {
    const fixture = TestBed.createComponent(AccountFilters);
    const emitted: AccountFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((filter) => emitted.push(filter));
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#accountSearch',
    );
    if (input === null) {
      throw new Error('The search input is missing.');
    }

    input.value = ' al';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.value = ' ali ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ search: 'ali' }]);
  });
});
