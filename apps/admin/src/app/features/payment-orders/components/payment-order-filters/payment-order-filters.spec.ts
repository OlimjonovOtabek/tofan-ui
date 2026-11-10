import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentOrderFilter } from '../../models/payment-order-filter';
import { PaymentOrderFilters } from './payment-order-filters';

const SEARCH_DEBOUNCE_MS = 400;
const TRAINER_ID = '452bcf11-d084-4224-a4d2-54a589dfc707';

describe('PaymentOrderFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function render(): {
    fixture: ComponentFixture<PaymentOrderFilters>;
    emitted: PaymentOrderFilter[];
    type: (selector: string, text: string) => void;
  } {
    const fixture = TestBed.createComponent(PaymentOrderFilters);
    const emitted: PaymentOrderFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((filter) => emitted.push(filter));
    fixture.detectChanges();
    const type = (selector: string, text: string): void => {
      const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
        selector,
      );
      if (input === null) {
        throw new Error(`The input ${selector} is missing.`);
      }
      input.value = text;
      input.dispatchEvent(new Event('input'));
      TestBed.tick();
    };
    return { fixture, emitted, type };
  }

  it('should emit the trimmed search once when typing settles', () => {
    const { emitted, type } = render();

    type('#paymentOrderSearch', ' otab');
    type('#paymentOrderSearch', ' otabek ');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ search: 'otabek' }]);
  });

  it('should not emit again when only spaces are added to the search', () => {
    const { emitted, type } = render();

    type('#paymentOrderSearch', 'otabek');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    type('#paymentOrderSearch', 'otabek  ');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ search: 'otabek' }]);
  });

  it('should list the trainers by name when trainers are given', () => {
    const { fixture } = render();
    fixture.componentRef.setInput('trainers', [
      { id: TRAINER_ID, displayName: 'Stage Coach', standardPrice: 200000 },
    ]);
    fixture.detectChanges();

    const trainer = (fixture.nativeElement as HTMLElement).querySelector('#paymentOrderTrainer');
    expect(trainer).not.toBeNull();
  });

  it('should emit an empty filter when the clear button is pressed', () => {
    const { fixture, emitted, type } = render();
    type('#paymentOrderSearch', 'otabek');
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
