import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { ValidationError } from '@shared/models/errors/validation.error';
import { PlatformFee } from './models/platform-fee';
import { PlatformFeeDraft } from './models/platform-fee-draft';
import { PlatformFeeStore } from './platform-fee.store';
import { PlatformFeeService } from './services/platform-fee.service';

const fee: PlatformFee = {
  commissionAmount: 50000,
  taxPercent: 0,
  providerFeePercent: 2,
  currencyCode: 'UZS',
};

const draft: PlatformFeeDraft = {
  commissionAmount: 60000.5,
  taxPercent: 12,
  providerFeePercent: 2.5,
};

describe('PlatformFeeStore', () => {
  let service: Pick<PlatformFeeService, 'get' | 'update'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  function createStore(): PlatformFeeStore {
    TestBed.configureTestingModule({
      providers: [
        PlatformFeeStore,
        { provide: PlatformFeeService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(PlatformFeeStore);
  }

  beforeEach(() => {
    service = {
      get: vi.fn().mockResolvedValue(fee),
      update: vi.fn().mockResolvedValue(undefined),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should expose the fee and no error when it loads', async () => {
    const store = createStore();

    await store.load();

    expect(store.fee()).toEqual(fee);
    expect(store.loadError()).toBeNull();
    expect(store.loading()).toBe(false);
  });

  it('should expose the error and no fee when loading fails', async () => {
    vi.mocked(service.get).mockRejectedValue(new ServiceUnavailableError());
    const store = createStore();

    await store.load();

    expect(store.fee()).toBeNull();
    expect(store.loadError()).toBe('errors.classes.network');
    expect(store.loading()).toBe(false);
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('should clear the error and expose the fee when a retry succeeds', async () => {
    vi.mocked(service.get).mockRejectedValueOnce(new ServiceUnavailableError());
    const store = createStore();
    await store.load();

    await store.load();

    expect(store.loadError()).toBeNull();
    expect(store.fee()).toEqual(fee);
  });

  it('should report the loading state when the fee is requested', async () => {
    const store = createStore();

    const loading = store.load();

    expect(store.loading()).toBe(true);
    await loading;
  });

  it('should send the draft, announce success and expose the reloaded values when saved', async () => {
    const reloaded: PlatformFee = { ...fee, ...draft };
    vi.mocked(service.get).mockResolvedValueOnce(fee).mockResolvedValueOnce(reloaded);
    const store = createStore();
    await store.load();

    await store.save(draft);

    expect(service.update).toHaveBeenCalledWith(draft);
    expect(notifications.success).toHaveBeenCalledWith('platformFee.toast.saved');
    expect(service.get).toHaveBeenCalledTimes(2);
    expect(store.fee()).toEqual(reloaded);
    expect(store.saving()).toBe(false);
  });

  it('should report the refusal and keep the values when saving fails', async () => {
    const refusal = new BusinessRuleError('No', 'PlatformFee.Invalid');
    vi.mocked(service.update).mockRejectedValue(refusal);
    const store = createStore();
    await store.load();

    await store.save(draft);

    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(notifications.success).not.toHaveBeenCalled();
    expect(service.get).toHaveBeenCalledTimes(1);
    expect(store.fee()).toEqual(fee);
    expect(store.saving()).toBe(false);
  });

  it('should refuse to send and report the issues when the draft is invalid', async () => {
    const store = createStore();
    await store.load();

    await store.save({ ...draft, taxPercent: 101 });

    expect(service.update).not.toHaveBeenCalled();
    expect(notifications.success).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(service.get).toHaveBeenCalledTimes(1);
    expect(store.fee()).toEqual(fee);
    expect(store.saving()).toBe(false);
  });

  it('should expose the load error when the reload after a save fails', async () => {
    const store = createStore();
    await store.load();
    vi.mocked(service.get).mockRejectedValue(new ServiceUnavailableError());

    await store.save(draft);

    expect(notifications.success).toHaveBeenCalledWith('platformFee.toast.saved');
    expect(store.loadError()).toBe('errors.classes.network');
    expect(store.fee()).toBeNull();
  });

  it('should report the saving state when the change is sent', async () => {
    const store = createStore();
    await store.load();

    const saving = store.save(draft);

    expect(store.saving()).toBe(true);
    await saving;
  });
});
