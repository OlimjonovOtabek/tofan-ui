import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlatformFee } from '../../models/platform-fee';
import { PlatformFeeDraft } from '../../models/platform-fee-draft';
import { PlatformFeeForm } from './platform-fee-form';

const FEE: PlatformFee = {
  commissionAmount: 50000,
  taxPercent: 12,
  providerFeePercent: 2.5,
  currencyCode: 'UZS',
};

const COMMISSION_INPUT = '#platformFeeCommissionAmount';
const TAX_INPUT = '#platformFeeTaxPercent';
const PROVIDER_INPUT = '#platformFeeProviderFeePercent';

describe('PlatformFeeForm', () => {
  async function render(fee: PlatformFee = FEE): Promise<{
    fixture: ComponentFixture<PlatformFeeForm>;
    emitted: PlatformFeeDraft[];
  }> {
    const fixture = TestBed.createComponent(PlatformFeeForm);
    fixture.componentRef.setInput('fee', fee);
    const emitted: PlatformFeeDraft[] = [];
    fixture.componentInstance.save.subscribe((draft) => emitted.push(draft));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, emitted };
  }

  function inputOf(fixture: ComponentFixture<PlatformFeeForm>, selector: string): HTMLInputElement {
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(selector);
    if (input === null) {
      throw new Error(`The input ${selector} is missing.`);
    }
    return input;
  }

  async function type(
    fixture: ComponentFixture<PlatformFeeForm>,
    selector: string,
    text: string,
  ): Promise<void> {
    const input = inputOf(fixture, selector);
    input.focus();
    input.value = text;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function submit(fixture: ComponentFixture<PlatformFeeForm>): Promise<void> {
    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    form?.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('should show the commission with its currency and both percents when the fee is given', async () => {
    const { fixture } = await render();

    expect(inputOf(fixture, COMMISSION_INPUT).value).toContain('50');
    expect(inputOf(fixture, COMMISSION_INPUT).value).toContain('UZS');
    expect(inputOf(fixture, TAX_INPUT).value).toContain('12');
    expect(inputOf(fixture, TAX_INPUT).value).toContain('%');
    expect(inputOf(fixture, PROVIDER_INPUT).value).toContain('2.5');
    expect(inputOf(fixture, PROVIDER_INPUT).value).toContain('%');
  });

  it('should explain that a change affects only later payments', async () => {
    const { fixture } = await render();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'faqat saqlangandan keyin ochilgan',
    );
  });

  it('should emit the draft of the shown values when the form is submitted untouched', async () => {
    const { fixture, emitted } = await render();

    await submit(fixture);

    expect(emitted).toEqual([{ commissionAmount: 50000, taxPercent: 12, providerFeePercent: 2.5 }]);
  });

  it('should emit the edited value when the commission is changed', async () => {
    const { fixture, emitted } = await render();

    await type(fixture, COMMISSION_INPUT, '75000');
    await submit(fixture);

    expect(emitted).toEqual([{ commissionAmount: 75000, taxPercent: 12, providerFeePercent: 2.5 }]);
  });

  it('should emit zero when a percent is set to zero', async () => {
    const { fixture, emitted } = await render();

    await type(fixture, TAX_INPUT, '0');
    await submit(fixture);

    expect(emitted).toEqual([{ commissionAmount: 50000, taxPercent: 0, providerFeePercent: 2.5 }]);
  });

  it('should not emit and show the error when a field is cleared', async () => {
    const { fixture, emitted } = await render();

    await type(fixture, PROVIDER_INPUT, '');
    await submit(fixture);

    expect(emitted).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      "0 dan 100 gacha, ko'pi bilan 2 kasrli son kiriting.",
    );
  });

  it('should show the reloaded values when the fee input changes', async () => {
    const { fixture } = await render();

    fixture.componentRef.setInput('fee', { ...FEE, commissionAmount: 99000, taxPercent: 0 });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(inputOf(fixture, COMMISSION_INPUT).value).toContain('99');
    expect(inputOf(fixture, TAX_INPUT).value).toContain('0');
    expect(inputOf(fixture, TAX_INPUT).value).not.toContain('12');
  });
});
