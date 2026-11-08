import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoldierOption } from '@shared/models/soldier-option';
import { PaymentOrderDraft } from '../../models/payment-order-draft';
import { TrainerOption } from '../../models/trainer-option';
import { PaymentOrderCreateDialog } from './payment-order-create-dialog';

const trainer: TrainerOption = {
  id: '452bcf11-d084-4224-a4d2-54a589dfc707',
  displayName: 'Stage Coach',
  standardPrice: 200000,
};

const soldier: SoldierOption = {
  userId: '6f0652dc-0978-4f16-b936-ca3363a33d1e',
  label: 'Probe User',
  userName: 'probe3108e8',
};

interface Rendered {
  readonly fixture: ComponentFixture<PaymentOrderCreateDialog>;
  readonly created: PaymentOrderDraft[];
}

async function render(): Promise<Rendered> {
  const fixture = TestBed.createComponent(PaymentOrderCreateDialog);
  const created: PaymentOrderDraft[] = [];
  fixture.componentInstance.create.subscribe((draft) => created.push(draft));
  fixture.componentRef.setInput('trainers', [trainer]);
  fixture.componentRef.setInput('soldiers', [soldier]);
  fixture.componentRef.setInput('visible', true);
  await settle(fixture);
  return { fixture, created };
}

async function settle(fixture: ComponentFixture<PaymentOrderCreateDialog>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

function find<T extends HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (found === null) {
    throw new Error(`The element ${selector} is missing.`);
  }
  return found;
}

async function pickOption(
  fixture: ComponentFixture<PaymentOrderCreateDialog>,
  label: string,
): Promise<void> {
  await settle(fixture);
  const option = Array.from(document.querySelectorAll<HTMLElement>('li[role="option"]')).find(
    (candidate) => candidate.textContent?.includes(label),
  );
  if (option === undefined) {
    throw new Error(`The option ${label} is missing.`);
  }
  option.click();
  await settle(fixture);
}

async function press(
  fixture: ComponentFixture<PaymentOrderCreateDialog>,
  label: string,
): Promise<void> {
  const button = Array.from(document.querySelectorAll('button')).find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  if (button === undefined) {
    throw new Error(`The button ${label} is missing.`);
  }
  button.click();
  await settle(fixture);
}

describe('PaymentOrderCreateDialog', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    });
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('should say that the order is a Pending Standard subscription when the dialog opens', async () => {
    await render();

    expect(document.body.textContent).toContain('Standard');
    expect(document.body.textContent).toContain('"Kutilmoqda"');
  });

  it('should not emit and should show every error when the form is sent empty', async () => {
    const { fixture, created } = await render();

    await press(fixture, 'Ochish');

    expect(created).toEqual([]);
    expect(document.body.textContent).toContain('Foydalanuvchini tanlang.');
    expect(document.body.textContent).toContain('Trenerni tanlang.');
    expect(document.body.textContent).toContain("Narxni so'mda");
  });

  it('should offer the trainer price and emit the draft when the form is filled', async () => {
    const { fixture, created } = await render();

    find<HTMLElement>('.p-autocomplete-dropdown').click();
    await pickOption(fixture, 'Probe User');
    find<HTMLElement>('app-select-field p-select').click();
    await pickOption(fixture, 'Stage Coach');
    expect(document.body.textContent).toMatch(/Trenerning Standard narxi: 200\s000 so'm/);
    await press(fixture, "Shu narxni qo'yish");
    await press(fixture, 'Ochish');

    expect(created).toEqual([{ userId: soldier.userId, trainerId: trainer.id, price: 200000 }]);
  });

  it('should not offer a trainer price when the trainer has no Standard price yet', async () => {
    const { fixture } = await render();
    fixture.componentRef.setInput('trainers', [{ ...trainer, standardPrice: 0 }]);
    await settle(fixture);

    find<HTMLElement>('app-select-field p-select').click();
    await pickOption(fixture, 'Stage Coach');

    expect(document.body.textContent).not.toContain('Trenerning Standard narxi');
    expect(document.body.textContent).not.toContain("Shu narxni qo'yish");
  });

  it('should clear the form and ask for the first soldiers again when the dialog is reopened', async () => {
    const { fixture } = await render();
    const searches: string[] = [];
    fixture.componentInstance.soldierSearch.subscribe((query) => searches.push(query));
    find<HTMLElement>('.p-autocomplete-dropdown').click();
    await pickOption(fixture, 'Probe User');

    fixture.componentRef.setInput('visible', false);
    await settle(fixture);
    fixture.componentRef.setInput('visible', true);
    await settle(fixture);

    expect(find<HTMLInputElement>('#orderUser').value).toBe('');
    expect(searches.at(-1)).toBe('');
  });

  it('should say so when the trainers did not load', async () => {
    const { fixture } = await render();

    fixture.componentRef.setInput('trainersFailed', true);
    await settle(fixture);

    expect(document.body.textContent).toContain("Trenerlar ro'yxati yuklanmadi.");
  });
});
