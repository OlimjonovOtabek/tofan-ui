import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainerListFilter } from '../../models/trainer-list-filter';
import { TrainerListFilters } from './trainer-list-filters';

const SEARCH_DEBOUNCE_MS = 400;

describe('TrainerListFilters', () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => vi.useRealTimers());

  function render(): {
    fixture: ComponentFixture<TrainerListFilters>;
    emitted: TrainerListFilter[];
    type: (text: string) => void;
  } {
    const fixture = TestBed.createComponent(TrainerListFilters);
    const emitted: TrainerListFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((filter) => emitted.push(filter));
    fixture.detectChanges();
    const type = (text: string): void => {
      const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
        '#trainerSearch',
      );
      if (input === null) {
        throw new Error('The search input is missing.');
      }
      input.value = text;
      input.dispatchEvent(new Event('input'));
      TestBed.tick();
    };
    return { fixture, emitted, type };
  }

  it('should emit the trimmed search once when typing settles', () => {
    const { emitted, type } = render();

    type('sta');
    type(' stage-coach ');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ search: 'stage-coach' }]);
  });

  it('should emit an empty filter when the clear button is pressed', () => {
    const { fixture, emitted, type } = render();
    type('stage');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    const clear = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Tozalash'));
    clear?.click();
    TestBed.tick();
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ search: 'stage' }, {}]);
  });
});
