import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { NotificationService } from '@core/feedback/notification.service';
import { TranslationKey } from '@core/i18n/dictionary';
import { Translator } from '@core/i18n/translator';
import { Tier } from '@shared/models/tier';
import { TrainerSubscription } from '../../models/trainer-subscription';
import { SoldierLookupService } from '@shared/components/soldier-field/soldier-lookup.service';
import { TrainerSubscriptionsService } from '../../services/trainer-subscriptions.service';
import { TrainersService } from '../../services/trainers.service';
import { TrainerSubscriptionsPage } from './trainer-subscriptions-page';

const FAR_FUTURE = new Date('2999-01-01T00:00:00Z');
const LONG_AGO = new Date('2020-01-01T00:00:00Z');

function subscription(id: string, tier: Tier, state: 'active' | 'ended'): TrainerSubscription {
  return new TrainerSubscription(
    id,
    't1',
    'Jasur Karimov',
    'u1',
    LONG_AGO,
    state === 'active' ? FAR_FUTURE : LONG_AGO,
    null,
    'a1',
    LONG_AGO,
    tier,
    null,
    null,
    false,
  );
}

describe('TrainerSubscriptionsPage', () => {
  let subscriptions: Pick<TrainerSubscriptionsService, 'list' | 'changeTier'>;
  let confirmations: Pick<ConfirmDialogService, 'confirm'>;

  async function render(rows: readonly TrainerSubscription[]): Promise<ComponentFixture<unknown>> {
    vi.mocked(subscriptions.list).mockResolvedValue({ items: rows, totalCount: rows.length });
    const fixture = TestBed.createComponent(TrainerSubscriptionsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function buttons(fixture: ComponentFixture<unknown>, key: TranslationKey): HTMLButtonElement[] {
    const label = TestBed.inject(Translator).translate(key);
    const root = fixture.nativeElement as HTMLElement;
    return Array.from(root.querySelectorAll<HTMLButtonElement>('button')).filter(
      (button) => button.getAttribute('aria-label') === label,
    );
  }

  function tierTags(fixture: ComponentFixture<unknown>): string[] {
    const root = fixture.nativeElement as HTMLElement;
    return Array.from(root.querySelectorAll('tbody tr')).map(
      (row) => row.querySelectorAll('td')[4]?.textContent?.trim() ?? '',
    );
  }

  beforeEach(() => {
    subscriptions = {
      list: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
      changeTier: vi.fn().mockResolvedValue(undefined),
    };
    confirmations = { confirm: vi.fn().mockResolvedValue(true) };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: TrainerSubscriptionsService, useValue: subscriptions },
        { provide: TrainersService, useValue: { list: vi.fn().mockResolvedValue({ items: [] }) } },
        { provide: SoldierLookupService, useValue: { search: vi.fn().mockResolvedValue([]) } },
        { provide: ConfirmDialogService, useValue: confirmations },
        { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    });
  });

  it('should show the tier of every subscription when the table loads', async () => {
    const fixture = await render([
      subscription('s1', 'standard', 'active'),
      subscription('s2', 'vip', 'ended'),
    ]);

    expect(tierTags(fixture)).toEqual(['Standard', 'VIP']);
  });

  it('should show the subscriber name and how the subscription was opened when the table loads', async () => {
    const paid = new TrainerSubscription(
      's3',
      't1',
      'Jasur Karimov',
      '3e41b4c1-713a-4e0b-b2f7-5b5b0384cedf',
      LONG_AGO,
      FAR_FUTURE,
      null,
      'a1',
      LONG_AGO,
      'standard',
      'Otabek Olimjonov',
      'otabek',
      true,
    );
    const fixture = await render([paid, subscription('s1', 'standard', 'active')]);

    const rows = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr'));
    const cell = (row: Element, index: number): string =>
      (row.querySelectorAll('td')[index]?.textContent ?? '').replace(/\s+/g, ' ').trim();
    expect(rows[0].querySelector('td:nth-child(2) a')?.textContent?.trim()).toBe(
      'Otabek Olimjonov',
    );
    expect(rows[0].querySelector('td:nth-child(2) div')?.textContent?.trim()).toBe('otabek');
    expect(cell(rows[0], 5)).toBe("To'lov orqali");
    expect(cell(rows[1], 1)).toBe('u1');
    expect(cell(rows[1], 5)).toBe('Admin bergan');
    expect(rows[0].querySelector('a')?.getAttribute('href')).toBe(
      '/soldiers/3e41b4c1-713a-4e0b-b2f7-5b5b0384cedf',
    );
  });

  it('should offer vip and standard actions when the subscriptions are active standard and active vip', async () => {
    const fixture = await render([
      subscription('s1', 'standard', 'active'),
      subscription('s2', 'vip', 'active'),
    ]);

    expect(buttons(fixture, 'trainers.subscriptions.actions.makeVip')).toHaveLength(1);
    expect(buttons(fixture, 'trainers.subscriptions.actions.makeStandard')).toHaveLength(1);
  });

  it('should offer no tier action when the subscription is ended', async () => {
    const fixture = await render([
      subscription('s1', 'standard', 'ended'),
      subscription('s2', 'vip', 'ended'),
    ]);

    expect(buttons(fixture, 'trainers.subscriptions.actions.makeVip')).toHaveLength(0);
    expect(buttons(fixture, 'trainers.subscriptions.actions.makeStandard')).toHaveLength(0);
  });

  it('should ask for confirmation and change the tier when the admin confirms', async () => {
    const fixture = await render([subscription('s1', 'standard', 'active')]);

    buttons(fixture, 'trainers.subscriptions.actions.makeVip')[0]?.click();
    await fixture.whenStable();

    expect(confirmations.confirm).toHaveBeenCalledWith(
      { key: 'trainers.subscriptions.confirmMakeVip', params: { name: 'Jasur Karimov' } },
      'trainers.subscriptions.actions.makeVip',
    );
    expect(subscriptions.changeTier).toHaveBeenCalledWith('s1', 'vip');
  });

  it('should keep the tier when the admin cancels the confirmation', async () => {
    vi.mocked(confirmations.confirm).mockResolvedValue(false);
    const fixture = await render([subscription('s1', 'vip', 'active')]);

    buttons(fixture, 'trainers.subscriptions.actions.makeStandard')[0]?.click();
    await fixture.whenStable();

    expect(confirmations.confirm).toHaveBeenCalled();
    expect(subscriptions.changeTier).not.toHaveBeenCalled();
  });
});
