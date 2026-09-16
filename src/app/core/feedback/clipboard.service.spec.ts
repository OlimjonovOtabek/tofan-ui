import { TestBed } from '@angular/core/testing';
import { ClipboardService } from './clipboard.service';
import { NotificationService } from './notification.service';

describe('ClipboardService', () => {
  let notifications: { success: ReturnType<typeof vi.fn>; info: ReturnType<typeof vi.fn> };
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    notifications = { success: vi.fn(), info: vi.fn() };
    writeText = vi.fn();
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    TestBed.configureTestingModule({
      providers: [{ provide: NotificationService, useValue: notifications }],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should confirm what was copied when the browser allows copying', async () => {
    writeText.mockResolvedValue(undefined);

    await TestBed.inject(ClipboardService).copy('abc', 'Fayl ID');

    expect(writeText).toHaveBeenCalledWith('abc');
    expect(notifications.success).toHaveBeenCalledWith('Fayl ID nusxalandi.');
  });

  it('should show the text when the browser refuses to copy', async () => {
    writeText.mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));

    await TestBed.inject(ClipboardService).copy('abc', 'Fayl ID');

    expect(notifications.info).toHaveBeenCalledWith("Nusxalab bo'lmadi. Fayl ID: abc");
  });
});
