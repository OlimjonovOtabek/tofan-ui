import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentOrderFilter } from '../../models/payment-order-filter';
import { PaymentOrderFilters } from './payment-order-filters';

const SEARCH_DEBOUNCE_MS = 400;
const USER_ID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';
const REFERENCE_ID = '452bcf11-d084-4224-a4d2-54a589dfc707';

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

  it('should emit both trimmed ids once when typing settles', () => {
    const { emitted, type } = render();

    type('#paymentOrderUserId', ` ${USER_ID} `);
    type('#paymentOrderReferenceId', REFERENCE_ID);
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ userId: USER_ID, referenceId: REFERENCE_ID }]);
  });

  it('should not emit and should say so when an id is not a UUID yet', () => {
    const { fixture, emitted, type } = render();

    type('#paymentOrderReferenceId', 'not-a-uuid');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    fixture.detectChanges();

    expect(emitted).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain("To'liq UUID kiriting.");
  });

  it('should emit an empty filter when the clear button is pressed', () => {
    const { fixture, emitted, type } = render();
    type('#paymentOrderUserId', USER_ID);
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    const clear = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Tozalash'));
    clear?.click();
    TestBed.tick();
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ userId: USER_ID }, {}]);
  });
});
