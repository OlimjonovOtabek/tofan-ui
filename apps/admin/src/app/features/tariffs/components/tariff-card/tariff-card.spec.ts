import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocaleStore } from '@core/i18n/locale.store';
import { Tariff } from '../../models/tariff';
import { TariffCard } from './tariff-card';

const limited: Tariff = {
  id: 't2',
  type: 'standard',
  monthlyPrice: 49000,
  totalPrice: 99000,
  foodScanLimit: 15,
  workoutVideoLimit: 30,
  dietMealTypes: ['lunch', 'dinner'],
  workoutChangeMonths: 3,
  dietChangeDays: 7,
  hasAiTrainerChat: true,
  benefits: [
    { en: 'Food scan', uz: 'Ovqat skaneri', ru: 'Скан еды' },
    { en: 'AI chat', uz: 'AI chat', ru: 'AI чат' },
  ],
};

const open: Tariff = {
  ...limited,
  id: 't3',
  type: 'vip',
  foodScanLimit: null,
  workoutVideoLimit: null,
  dietMealTypes: null,
  workoutChangeMonths: null,
  dietChangeDays: null,
  hasAiTrainerChat: false,
  benefits: [],
};

function render(tariff: Tariff): ComponentFixture<TariffCard> {
  const fixture = TestBed.createComponent(TariffCard);
  fixture.componentRef.setInput('tariff', tariff);
  fixture.detectChanges();
  return fixture;
}

function textOf(fixture: ComponentFixture<TariffCard>): string {
  const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
  return text.replace(/\s+/g, ' ');
}

function valueOf(fixture: ComponentFixture<TariffCard>, label: string): string {
  const terms = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('dt'));
  const term = terms.find((candidate) => candidate.textContent?.trim() === label);
  return term?.nextElementSibling?.textContent?.trim() ?? '';
}

describe('TariffCard', () => {
  afterEach(() => localStorage.clear());

  it('should show the tariff name, the monthly price and the total price', () => {
    const text = textOf(render(limited));

    expect(text).toContain('Standard');
    expect(text).toContain("49 000 so'm");
    expect(text).toContain("99 000 so'm");
  });

  it('should describe the numeric limits in words when the limits are set', () => {
    const text = textOf(render(limited));

    expect(text).toContain('Oyiga 15 ta');
    expect(text).toContain('30 ta video ochiq');
    expect(text).toContain('Har 3 oyda');
    expect(text).toContain('Har 7 kunda');
    expect(text).toContain('Tushlik');
    expect(text).toContain('Kechki ovqat');
  });

  it('should describe the open limits in words when the limits are null', () => {
    const text = textOf(render(open));

    expect(text).toContain('Cheksiz');
    expect(text).toContain('Hammasi ochiq');
    expect(text).toContain('Hamma ovqat ochiq');
    expect(text).toContain('Almashmaydi');
  });

  it('should say scan is closed when the scan limit is zero', () => {
    expect(textOf(render({ ...limited, foodScanLimit: 0 }))).toContain('Scan yopiq');
  });

  it('should say whether the AI trainer chat is included when the flag is set', () => {
    expect(valueOf(render(limited), 'AI trener chati')).toBe('Bor');
    expect(valueOf(render(open), 'AI trener chati')).toBe("Yo'q");
  });

  it('should list the benefits in the active language when benefits exist', () => {
    const fixture = render(limited);
    expect(textOf(fixture)).toContain('Ovqat skaneri');

    TestBed.inject(LocaleStore).setLocale('ru');
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Скан еды');
    expect(textOf(fixture)).not.toContain('Ovqat skaneri');
  });

  it('should say there are no benefits when the list is empty', () => {
    expect(textOf(render(open))).toContain('Imtiyozlar hali kiritilmagan.');
  });

  it('should emit edit when the edit button is clicked', () => {
    const fixture = render(limited);
    const edited = vi.fn();
    fixture.componentInstance.edit.subscribe(edited);

    const button = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((candidate) => candidate.textContent?.includes('Tahrirlash'));
    button?.click();

    expect(edited).toHaveBeenCalledTimes(1);
  });
});
