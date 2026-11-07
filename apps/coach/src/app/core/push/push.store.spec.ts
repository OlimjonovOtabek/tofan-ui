import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotificationService } from '@core/feedback/notification.service';
import { Subject } from 'rxjs';
import { DeviceTokensService } from './device-tokens.service';
import { PushMessagingService, WorkerPushEvent } from './push-messaging.service';
import { PushStore } from './push.store';

describe('PushStore', () => {
  const events = new Subject<WorkerPushEvent>();
  const messaging = {
    supported: true,
    permission: 'default',
    requestPermission: vi.fn(),
    createToken: vi.fn(),
    removeToken: vi.fn(),
    workerEvents: () => events,
  };
  const deviceTokens = { register: vi.fn(), unregister: vi.fn() };
  const notifications = { failure: vi.fn(), error: vi.fn() };
  const router = { navigateByUrl: vi.fn() };
  let store: PushStore;

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    messaging.permission = 'default';
    TestBed.configureTestingModule({
      providers: [
        { provide: PushMessagingService, useValue: messaging },
        { provide: DeviceTokensService, useValue: deviceTokens },
        { provide: NotificationService, useValue: notifications },
        { provide: Router, useValue: router },
      ],
    });
    store = TestBed.inject(PushStore);
  });

  it('should register the token when the coach allows notifications', async () => {
    messaging.requestPermission.mockResolvedValue('granted');
    messaging.createToken.mockResolvedValue('t1');

    await store.toggle();

    expect(deviceTokens.register).toHaveBeenCalledWith('t1');
    expect(store.enabled()).toBe(true);
    expect(localStorage.getItem('coach.push.token')).toBe('t1');
  });

  it('should stay off and say so when the browser refuses', async () => {
    messaging.requestPermission.mockResolvedValue('denied');

    await store.toggle();

    expect(store.enabled()).toBe(false);
    expect(deviceTokens.register).not.toHaveBeenCalled();
    expect(notifications.failure).toHaveBeenCalledWith('coachApp.push.denied');
  });

  it('should unregister the token when turned off', async () => {
    messaging.requestPermission.mockResolvedValue('granted');
    messaging.createToken.mockResolvedValue('t1');
    await store.toggle();

    await store.toggle();

    expect(deviceTokens.unregister).toHaveBeenCalledWith('t1');
    expect(messaging.removeToken).toHaveBeenCalled();
    expect(store.enabled()).toBe(false);
  });

  it('should report a failure and stay off', async () => {
    const failure = new Error('offline');
    messaging.requestPermission.mockResolvedValue('granted');
    messaging.createToken.mockRejectedValue(failure);

    await store.toggle();

    expect(notifications.error).toHaveBeenCalledWith(failure);
    expect(store.enabled()).toBe(false);
    expect(store.busy()).toBe(false);
  });

  it('should open the screen of a tapped push', () => {
    store.start();

    events.next({ opened: true, data: { source: 'chat', conversationId: 'c1' } });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/chat/c/c1');
  });

  it('should warn about a failed video in front without moving', () => {
    store.start();

    events.next({ opened: false, data: { source: 'video', type: '14' } });

    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(notifications.failure).toHaveBeenCalledWith('coachApp.push.videoFailed');
  });
});
