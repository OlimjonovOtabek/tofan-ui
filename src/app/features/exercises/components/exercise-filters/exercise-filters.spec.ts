import { TestBed } from '@angular/core/testing';
import { ExerciseFilter } from '../../models/exercise-filter';
import { ExerciseFilters } from './exercise-filters';

const SEARCH_DEBOUNCE_MS = 400;

describe('ExerciseFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function render(): { emitted: ExerciseFilter[]; input: HTMLInputElement } {
    const fixture = TestBed.createComponent(ExerciseFilters);
    const emitted: ExerciseFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((filter) => emitted.push(filter));
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#search');
    if (input === null) {
      throw new Error('The search input is missing.');
    }
    return { emitted, input };
  }

  it('should emit the trimmed search once when typing settles', () => {
    const { emitted, input } = render();

    input.value = ' squ';
    input.dispatchEvent(new Event('input'));
    input.value = ' squat ';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ search: 'squat' }]);
  });

  it('should emit an empty filter when the search is cleared', () => {
    const { emitted, input } = render();

    input.value = '   ';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{}]);
  });
});
