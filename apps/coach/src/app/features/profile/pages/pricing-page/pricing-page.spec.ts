import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { CoachProfileService } from '@coach/core/profile/coach-profile.service';
import { NotificationService } from '@core/feedback/notification.service';
import { TranslationKey } from '@core/i18n/dictionary';
import { Translator } from '@core/i18n/translator';
import { PricingPage } from './pricing-page';

const profile = {
  id: 'p',
  userId: 'u',
  displayName: 'Aziz',
  slug: 'aziz',
  bio: null,
  photoFileId: null,
  photoUrl: null,
  monthlyPrice: 200000,
  vipMonthlyPrice: 400000,
  isPublished: true,
};

describe('PricingPage', () => {
  const profiles = { get: vi.fn(), update: vi.fn() };
  const notifications = { success: vi.fn(), error: vi.fn(), failure: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    profiles.update.mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: CoachProfileService, useValue: profiles },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  async function open(vipMonthlyPrice: number | null) {
    profiles.get.mockResolvedValue({ ...profile, vipMonthlyPrice });
    const fixture = TestBed.createComponent(PricingPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const inputs = element.querySelectorAll('input');
    return {
      fixture,
      element,
      price: inputs[0],
      vip: inputs[1],
      type(input: HTMLInputElement, value: string) {
        input.value = value;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
      },
      async save() {
        element.querySelector<HTMLButtonElement>('button[coachButton], button.c-button')?.click();
        await fixture.whenStable();
        fixture.detectChanges();
      },
    };
  }

  function text(key: TranslationKey): string {
    return TestBed.inject(Translator).translate(key);
  }

  it('should show the VIP field with the current VIP price and the VIP note when the coach has a VIP price', async () => {
    const page = await open(400000);

    expect(page.price.value).toBe('200000');
    expect(page.vip.value).toBe('400000');
    expect(page.element.textContent).toContain(text('coachApp.pricing.vipLabel'));
    expect(page.element.textContent).toContain(text('coachApp.pricing.vipNote'));
  });

  it('should leave the VIP field empty when the coach does not sell VIP', async () => {
    const page = await open(null);

    expect(page.vip.value).toBe('');
  });

  it('should refuse a VIP price of zero and not save when the coach types zero', async () => {
    const page = await open(null);
    page.type(page.vip, '0');

    await page.save();

    expect(profiles.update).not.toHaveBeenCalled();
    expect(page.element.textContent).toContain(text('coachApp.pricing.vipInvalid'));
  });

  it('should save the VIP price together with the monthly price when both fields are filled', async () => {
    const page = await open(null);
    page.type(page.price, '250000');
    page.type(page.vip, '500000');

    await page.save();

    expect(profiles.update).toHaveBeenCalledWith(
      expect.objectContaining({ monthlyPrice: 250000, vipMonthlyPrice: 500000 }),
    );
  });

  it('should save a null VIP price when the VIP field is cleared', async () => {
    const page = await open(400000);
    page.type(page.vip, '');

    await page.save();

    expect(profiles.update).toHaveBeenCalledWith(
      expect.objectContaining({ monthlyPrice: 200000, vipMonthlyPrice: null }),
    );
  });
});
