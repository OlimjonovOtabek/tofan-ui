import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { API_BASE_URL } from '@core/http/api-base-url';
import { Translator } from '@core/i18n/translator';
import { Trainer } from '../../models/trainer';
import { TrainerAccount } from '../../models/trainer-account';
import { TrainerEditDraft } from '../../models/trainer-edit-draft';
import { TrainerEditDialog } from './trainer-edit-dialog';

const VIP_INPUT = '#editTrainerVipPrice';
const NAME_INPUT = '#editTrainerDisplayName';

const account: TrainerAccount = {
  username: 'jasur',
  email: 'jasur@example.com',
  phoneNumber: '+998901234567',
};

function trainerSelling(vipMonthlyPrice: number | null): Trainer {
  return new Trainer(
    't1',
    'u1',
    'Jasur Karimov',
    'Kalistenika',
    null,
    null,
    350000,
    true,
    new Date('2026-10-02T09:00:00Z'),
    null,
    vipMonthlyPrice,
  );
}

interface Rendered {
  readonly fixture: ComponentFixture<TrainerEditDialog>;
  readonly saved: TrainerEditDraft[];
}

async function render(trainer: Trainer): Promise<Rendered> {
  const fixture = TestBed.createComponent(TrainerEditDialog);
  fixture.componentRef.setInput('visible', true);
  fixture.componentRef.setInput('trainer', trainer);
  fixture.componentRef.setInput('account', account);
  const saved: TrainerEditDraft[] = [];
  fixture.componentInstance.save.subscribe((draft) => saved.push(draft));
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return { fixture, saved };
}

function inputOf(selector: string): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>(selector);
  if (input === null) {
    throw new Error(`The ${selector} input is missing.`);
  }
  return input;
}

async function type(fixture: ComponentFixture<TrainerEditDialog>, selector: string, text: string) {
  const input = inputOf(selector);
  input.focus();
  input.value = text;
  input.dispatchEvent(new Event('input'));
  input.dispatchEvent(new Event('blur'));
  fixture.detectChanges();
  await fixture.whenStable();
}

function submit(): void {
  document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
}

describe('TrainerEditDialog', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    });
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('should prefill the VIP price field when the trainer sells VIP', async () => {
    await render(trainerSelling(700000));

    expect(inputOf(VIP_INPUT).value.replace(/\D/g, '')).toBe('700000');
  });

  it('should leave the VIP price field empty when the trainer sells Standard only', async () => {
    await render(trainerSelling(null));

    expect(inputOf(VIP_INPUT).value).toBe('');
  });

  it('should explain that an empty VIP price means Standard only when the form is open', async () => {
    await render(trainerSelling(null));

    const hint = TestBed.inject(Translator).translate('trainers.edit.vipPriceHint');
    expect(document.body.textContent).toContain(hint);
  });

  it('should keep the VIP price in the saved draft when only the name is edited', async () => {
    const { fixture, saved } = await render(trainerSelling(700000));

    await type(fixture, NAME_INPUT, 'Jasur K.');
    submit();

    expect(saved).toHaveLength(1);
    expect(saved[0]?.displayName).toBe('Jasur K.');
    expect(saved[0]?.vipMonthlyPrice).toBe(700000);
  });

  it('should save a null VIP price when the admin cleared the field', async () => {
    const { fixture, saved } = await render(trainerSelling(700000));

    await type(fixture, VIP_INPUT, '');
    submit();

    expect(saved).toHaveLength(1);
    expect(saved[0]?.vipMonthlyPrice).toBeNull();
  });

  it('should save the new VIP price when the admin typed one', async () => {
    const { fixture, saved } = await render(trainerSelling(null));

    await type(fixture, VIP_INPUT, '800000');
    submit();

    expect(saved[0]?.vipMonthlyPrice).toBe(800000);
  });

  it('should refuse to save and show the error when the VIP price is zero', async () => {
    const { fixture, saved } = await render(trainerSelling(700000));

    await type(fixture, VIP_INPUT, '0');
    submit();
    fixture.detectChanges();
    await fixture.whenStable();

    const error = TestBed.inject(Translator).translate('trainers.edit.errors.vipPrice');
    expect(saved).toEqual([]);
    expect(document.body.textContent).toContain(error);
  });
});
