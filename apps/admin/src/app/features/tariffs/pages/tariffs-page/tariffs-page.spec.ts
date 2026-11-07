import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { Tariff } from '../../models/tariff';
import { TariffsService } from '../../services/tariffs.service';
import { TariffsPage } from './tariffs-page';

function tariff(overrides: Partial<Tariff>): Tariff {
  return {
    id: 't',
    type: 'standard',
    monthlyPrice: 49000,
    totalPrice: 99000,
    foodScanLimit: 15,
    workoutVideoLimit: null,
    dietMealTypes: null,
    workoutChangeMonths: null,
    dietChangeDays: null,
    hasAiTrainerChat: true,
    benefits: [],
    ...overrides,
  };
}

const tariffs: readonly Tariff[] = [
  tariff({ id: 'f', type: 'free', monthlyPrice: 0, totalPrice: 0, hasAiTrainerChat: false }),
  tariff({ id: 's', type: 'standard' }),
  tariff({ id: 'v', type: 'vip', monthlyPrice: 99000, totalPrice: 149000 }),
];

describe('TariffsPage', () => {
  let service: Pick<TariffsService, 'list' | 'change'>;

  async function render(): Promise<ComponentFixture<TariffsPage>> {
    TestBed.configureTestingModule({
      providers: [
        { provide: TariffsService, useValue: service },
        { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(TariffsPage);
    await settle(fixture);
    return fixture;
  }

  async function settle(fixture: ComponentFixture<TariffsPage>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function buttons(label: string): HTMLButtonElement[] {
    return Array.from(document.querySelectorAll('button')).filter(
      (candidate) => candidate.textContent?.trim() === label,
    );
  }

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue(tariffs),
      change: vi.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => document.body.replaceChildren());

  it('should show the Free, Standard and VIP cards in that order when the tariffs load', async () => {
    const fixture = await render();

    const titles = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('app-tariff-card h2'),
    ).map((title) => title.textContent?.trim());

    expect(titles).toEqual(['Free', 'Standard', 'VIP']);
  });

  it('should show the error with a retry when the tariffs fail to load', async () => {
    service.list = vi.fn().mockRejectedValueOnce(new ServiceUnavailableError('down'));
    const fixture = await render();
    expect((fixture.nativeElement as HTMLElement).querySelector('p-message')).not.toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('app-tariff-card')).toHaveLength(
      0,
    );

    service.list = vi.fn().mockResolvedValue(tariffs);
    buttons('Qayta urinish')[0]?.click();
    await settle(fixture);

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('app-tariff-card')).toHaveLength(
      3,
    );
  });

  it('should send all seven fields and reload when the Standard tariff is edited and saved', async () => {
    const fixture = await render();

    buttons('Tahrirlash')[1]?.click();
    await settle(fixture);
    buttons('Saqlash')[0]?.click();
    await settle(fixture);

    expect(service.change).toHaveBeenCalledWith('standard', {
      monthlyPrice: 49000,
      foodScanLimit: 15,
      workoutVideoLimit: null,
      dietMealTypes: null,
      workoutChangeMonths: null,
      dietChangeDays: null,
      hasAiTrainerChat: true,
    });
    expect(service.list).toHaveBeenCalledTimes(2);
  });
});
