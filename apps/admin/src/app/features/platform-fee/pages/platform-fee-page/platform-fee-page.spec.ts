import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { NotificationService } from '@core/feedback/notification.service';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { PlatformFee } from '../../models/platform-fee';
import { PlatformFeeService } from '../../services/platform-fee.service';
import { PlatformFeePage } from './platform-fee-page';

const FEE: PlatformFee = {
  commissionAmount: 50000,
  taxPercent: 0,
  providerFeePercent: 2,
  currencyCode: 'UZS',
};

const SETTLE_ROUNDS = 3;

describe('PlatformFeePage', () => {
  let service: Pick<PlatformFeeService, 'get' | 'update'>;
  let confirmations: Pick<ConfirmDialogService, 'confirm'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  async function render(): Promise<ComponentFixture<PlatformFeePage>> {
    TestBed.configureTestingModule({
      providers: [
        { provide: PlatformFeeService, useValue: service },
        { provide: ConfirmDialogService, useValue: confirmations },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    const fixture = TestBed.createComponent(PlatformFeePage);
    await settle(fixture);
    return fixture;
  }

  async function settle(fixture: ComponentFixture<PlatformFeePage>): Promise<void> {
    for (let round = 0; round < SETTLE_ROUNDS; round++) {
      fixture.detectChanges();
      await fixture.whenStable();
    }
    fixture.detectChanges();
  }

  function textOf(fixture: ComponentFixture<PlatformFeePage>): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  async function submit(fixture: ComponentFixture<PlatformFeePage>): Promise<void> {
    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    form?.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle(fixture);
  }

  beforeEach(() => {
    service = {
      get: vi.fn().mockResolvedValue(FEE),
      update: vi.fn().mockResolvedValue(undefined),
    };
    confirmations = { confirm: vi.fn().mockResolvedValue(true) };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should show the form with the loaded fee when the page opens', async () => {
    const fixture = await render();

    expect(service.get).toHaveBeenCalledTimes(1);
    expect(textOf(fixture)).toContain('Platform fee');
    const commission = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#platformFeeCommissionAmount',
    );
    expect(commission?.value).toContain('UZS');
  });

  it('should show the error and no form when the fee cannot be loaded', async () => {
    vi.mocked(service.get).mockRejectedValue(new ServiceUnavailableError());

    const fixture = await render();

    expect((fixture.nativeElement as HTMLElement).querySelector('form')).toBeNull();
    expect(textOf(fixture)).toContain('Qayta urinish');
  });

  it('should load again and show the form when the admin retries', async () => {
    vi.mocked(service.get).mockRejectedValueOnce(new ServiceUnavailableError());
    const fixture = await render();

    const retry = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Qayta urinish'));
    retry?.click();
    await settle(fixture);

    expect(service.get).toHaveBeenCalledTimes(2);
    expect((fixture.nativeElement as HTMLElement).querySelector('form')).not.toBeNull();
  });

  it('should ask for confirmation before saving when the fee form is submitted', async () => {
    const fixture = await render();

    await submit(fixture);

    expect(confirmations.confirm).toHaveBeenCalledWith(
      { key: 'platformFee.confirm.message' },
      'platformFee.confirm.header',
    );
  });

  it('should save the fee and show the reloaded values when the admin confirms', async () => {
    const fixture = await render();

    await submit(fixture);

    expect(service.update).toHaveBeenCalledWith({
      commissionAmount: 50000,
      taxPercent: 0,
      providerFeePercent: 2,
    });
    expect(service.get).toHaveBeenCalledTimes(2);
    expect(notifications.success).toHaveBeenCalledWith('platformFee.toast.saved');
  });

  it('should not save when the admin declines the confirmation', async () => {
    vi.mocked(confirmations.confirm).mockResolvedValue(false);
    const fixture = await render();

    await submit(fixture);

    expect(service.update).not.toHaveBeenCalled();
    expect(notifications.success).not.toHaveBeenCalled();
  });

  it('should keep the form and report the refusal when saving fails', async () => {
    const refusal = new ServiceUnavailableError();
    vi.mocked(service.update).mockRejectedValue(refusal);
    const fixture = await render();

    await submit(fixture);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect((fixture.nativeElement as HTMLElement).querySelector('form')).not.toBeNull();
  });
});
