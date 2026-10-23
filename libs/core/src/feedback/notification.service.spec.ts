import { TestBed } from '@angular/core/testing';
import { MessageService } from '@openng/optimus-ui/api';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let add: ReturnType<typeof vi.fn>;
  let service: NotificationService;

  beforeEach(() => {
    add = vi.fn();
    TestBed.configureTestingModule({ providers: [{ provide: MessageService, useValue: { add } }] });
    service = TestBed.inject(NotificationService);
  });

  it('should show an error toast with the translated text when a failure key is given', () => {
    service.failure('coachApp.signIn.invalidCredentials');

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', detail: "Email yoki parol noto'g'ri" }),
    );
  });

  it('should show a success toast with the translated text when a success key is given', () => {
    service.success('coachApp.common.retry');

    expect(add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', detail: 'Qayta urinish' }));
  });
});
