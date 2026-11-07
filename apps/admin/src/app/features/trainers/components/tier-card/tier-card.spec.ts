import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Translator } from '@core/i18n/translator';
import { Tier } from '@shared/models/tier';
import { TierCard } from './tier-card';

function render(tier: Tier, benefits: readonly string[]): ComponentFixture<TierCard> {
  const fixture = TestBed.createComponent(TierCard);
  fixture.componentRef.setInput('tier', tier);
  fixture.componentRef.setInput('benefits', benefits);
  fixture.detectChanges();
  return fixture;
}

function text(fixture: ComponentFixture<TierCard>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

describe('TierCard', () => {
  it('should show the tier name as the heading when the card is rendered', () => {
    const fixture = render('vip', []);

    const heading = (fixture.nativeElement as HTMLElement).querySelector('h2');

    expect(heading?.textContent?.trim()).toBe('VIP');
  });

  it('should list the benefits in the given order when the card has several', () => {
    const fixture = render('standard', ['Birinchi', 'Ikkinchi']);

    const items = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li')).map(
      (item) => item.textContent?.trim(),
    );

    expect(items).toEqual(['Birinchi', 'Ikkinchi']);
  });

  it('should say that no benefits are set when the list is empty', () => {
    const fixture = render('standard', []);

    expect(text(fixture)).toContain(TestBed.inject(Translator).translate('trainers.tiers.empty'));
    expect((fixture.nativeElement as HTMLElement).querySelector('li')).toBeNull();
  });

  it('should emit edit when the benefits button is pressed', () => {
    const fixture = render('vip', ['Chat']);
    const edited = vi.fn();
    fixture.componentInstance.edit.subscribe(edited);
    const label = TestBed.inject(Translator).translate('trainers.tiers.edit');
    const button = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((candidate) => candidate.textContent?.trim() === label);

    button?.click();

    expect(edited).toHaveBeenCalledTimes(1);
  });
});
