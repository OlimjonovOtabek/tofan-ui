import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionListFilter } from '../../models/user-session-filter';
import { UserSessionFilters } from './user-session-filters';

const SEARCH_DEBOUNCE_MS = 400;

describe('UserSessionFilters', () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => vi.useRealTimers());

  function render(): {
    fixture: ComponentFixture<UserSessionFilters>;
    emitted: SessionListFilter[];
    type: (text: string) => void;
  } {
    const fixture = TestBed.createComponent(UserSessionFilters);
    const emitted: SessionListFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((filter) => emitted.push(filter));
    fixture.detectChanges();
    const type = (text: string): void => {
      const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
        '#sessionSearch',
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

  it('should emit the trimmed username once when typing settles', () => {
    const { emitted, type } = render();

    type('sta');
    type(' stage-admin ');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ search: 'stage-admin' }]);
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
