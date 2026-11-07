import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NotificationService } from '@core/feedback/notification.service';
import { LocaleStore } from '@core/i18n/locale.store';
import { Translator } from '@core/i18n/translator';
import { BenefitsDialog } from '@shared/components/benefits-dialog/benefits-dialog';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { TierBenefits } from '../../models/tier-benefits';
import { TierBenefitsService } from '../../services/tier-benefits.service';
import { TrainerTiersPage } from './trainer-tiers-page';

const programs = { en: 'Programs', ru: 'Программы', uz: 'Dasturlar' };
const diets = { en: 'Diets', ru: 'Рационы', uz: 'Ratsionlar' };
const chat = { en: '1:1 chat', ru: 'Чат 1:1', uz: '1:1 chat' };

const tiers: TierBenefits[] = [
  { tier: 'standard', benefits: [programs, diets] },
  { tier: 'vip', benefits: [programs, diets, chat] },
];

describe('TrainerTiersPage', () => {
  let service: Pick<TierBenefitsService, 'list' | 'change'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  async function render(): Promise<ComponentFixture<TrainerTiersPage>> {
    TestBed.configureTestingModule({
      providers: [
        { provide: TierBenefitsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    const fixture = TestBed.createComponent(TrainerTiersPage);
    await settle(fixture);
    return fixture;
  }

  async function settle(fixture: ComponentFixture<TrainerTiersPage>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function translate(...args: Parameters<Translator['translate']>): string {
    return TestBed.inject(Translator).translate(...args);
  }

  function cards(fixture: ComponentFixture<TrainerTiersPage>): HTMLElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('section'));
  }

  function cardTexts(card: HTMLElement): string[] {
    return Array.from(card.querySelectorAll('li')).map((item) => item.textContent?.trim() ?? '');
  }

  function buttonIn(root: ParentNode, label: string): HTMLButtonElement {
    const button = Array.from(root.querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.trim() === label,
    );
    if (button === undefined) {
      throw new Error(`No button "${label}"`);
    }
    return button;
  }

  function dialogRows(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('ol li'));
  }

  function dialogIsOpen(fixture: ComponentFixture<TrainerTiersPage>): boolean {
    return fixture.debugElement
      .query(By.directive(BenefitsDialog))
      .injector.get(BenefitsDialog)
      .visible();
  }

  beforeEach(() => {
    localStorage.clear();
    service = {
      list: vi.fn().mockResolvedValue(tiers),
      change: vi.fn().mockResolvedValue(undefined),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should show a card for Standard and one for VIP in that order', async () => {
    const fixture = await render();

    const headings = cards(fixture).map((card) => card.querySelector('h2')?.textContent?.trim());

    expect(headings).toEqual(['Standard', 'VIP']);
  });

  it('should list each tier benefits in the admin language', async () => {
    const fixture = await render();

    const [standard, vip] = cards(fixture);

    expect(cardTexts(standard)).toEqual(['Dasturlar', 'Ratsionlar']);
    expect(cardTexts(vip)).toEqual(['Dasturlar', 'Ratsionlar', '1:1 chat']);
  });

  it('should switch the benefits to Russian when the admin language changes', async () => {
    const fixture = await render();

    TestBed.inject(LocaleStore).setLocale('ru');
    await settle(fixture);

    expect(cardTexts(cards(fixture)[1])).toEqual(['Программы', 'Рационы', 'Чат 1:1']);
  });

  it('should show the error and load again when retry is pressed', async () => {
    vi.mocked(service.list).mockRejectedValueOnce(new ServiceUnavailableError());
    const fixture = await render();
    const root = fixture.nativeElement as HTMLElement;

    expect(cards(fixture)).toHaveLength(0);
    expect(root.querySelector('p-message')).not.toBeNull();

    buttonIn(root, translate('common.actions.retry')).click();
    await settle(fixture);

    expect(service.list).toHaveBeenCalledTimes(2);
    expect(cards(fixture)).toHaveLength(2);
  });

  it('should open the benefits of the pressed tier in the dialog', async () => {
    const fixture = await render();

    buttonIn(cards(fixture)[1], translate('trainers.tiers.edit')).click();
    await settle(fixture);

    expect(dialogRows().map((row) => row.querySelector('input')?.value)).toEqual([
      'Programs',
      'Diets',
      '1:1 chat',
    ]);
    expect(document.body.textContent).toContain(
      translate('trainers.tiers.dialogHeader', { tier: 'VIP' }),
    );
  });

  it('should save the whole reordered list for the pressed tier', async () => {
    const fixture = await render();
    buttonIn(cards(fixture)[0], translate('trainers.tiers.edit')).click();
    await settle(fixture);

    const moveDown = document.querySelector<HTMLButtonElement>(
      `button[aria-label="${translate('common.benefits.moveDown', { number: 1 })}"]`,
    );
    moveDown?.click();
    await settle(fixture);
    buttonIn(document, translate('common.actions.save')).click();
    await settle(fixture);

    expect(service.change).toHaveBeenCalledWith('standard', [diets, programs]);
    expect(notifications.success).toHaveBeenCalledWith('trainers.tiers.saved');
    await vi.waitFor(() => expect(dialogIsOpen(fixture)).toBe(false));
  });

  it('should keep the dialog open and show the error when the backend refuses', async () => {
    const refusal = new ServiceUnavailableError();
    vi.mocked(service.change).mockRejectedValue(refusal);
    const fixture = await render();
    buttonIn(cards(fixture)[0], translate('trainers.tiers.edit')).click();
    await settle(fixture);

    buttonIn(document, translate('common.actions.save')).click();
    await settle(fixture);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(dialogIsOpen(fixture)).toBe(true);
    expect(dialogRows()).toHaveLength(2);
  });
});
