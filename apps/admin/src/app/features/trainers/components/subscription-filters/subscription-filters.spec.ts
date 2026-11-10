import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubscriptionFilter } from '../../models/subscription-filter';
import { SubscriptionFilters } from './subscription-filters';

const SEARCH_DEBOUNCE_MS = 400;

describe('SubscriptionFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function render(): {
    fixture: ComponentFixture<SubscriptionFilters>;
    emitted: SubscriptionFilter[];
    type: (text: string) => void;
  } {
    const fixture = TestBed.createComponent(SubscriptionFilters);
    fixture.componentRef.setInput('trainerOptions', []);
    const emitted: SubscriptionFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((filter) => emitted.push(filter));
    fixture.detectChanges();
    const type = (text: string): void => {
      const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
        '#subscriptionSearch',
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

    type(' ota');
    type(' otabek ');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ search: 'otabek' }]);
  });

  it('should ask for subscriptions that end soon when the toggle is switched on', () => {
    const { fixture, emitted } = render();

    const toggle = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#subscriptionEndingSoon',
    );
    toggle?.click();
    TestBed.tick();
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ endingSoon: true }]);
  });

  it('should emit an empty filter when the clear button is pressed', () => {
    const { fixture, emitted, type } = render();
    type('otabek');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    const clear = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Tozalash'));
    clear?.click();
    TestBed.tick();
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ search: 'otabek' }, {}]);
  });
});
