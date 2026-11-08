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
    available: vi.fn(),
    permission: 'default',
    requestPermission: vi.fn(),
    createToken: vi.fn(),
    removeToken: vi.fn(),
    workerEvents: () => events,
  };
  const deviceTokens = { register: vi.fn(), unregister: vi.fn() };
  const notifications = { failure: vi.fn(), error: vi.fn(), announce: vi.fn() };
  const router = { navigateByUrl: vi.fn() };
  let store: PushStore;

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    messaging.permission = 'default';
    messaging.available.mockResolvedValue(true);
    deviceTokens.register.mockResolvedValue(undefined);
    deviceTokens.unregister.mockResolvedValue(undefined);
    store = createStore();
  });

  function createStore(): PushStore {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: PushMessagingService, useValue: messaging },
        { provide: DeviceTokensService, useValue: deviceTokens },
        { provide: NotificationService, useValue: notifications },
        { provide: Router, useValue: router },
      ],
    });
    return TestBed.inject(PushStore);
  }

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

  it('should offer push when the container gives a Firebase config', async () => {
    store.start();

    await vi.waitFor(() => expect(store.supported()).toBe(true));
  });

  it('should hide push when the container has no Firebase config', async () => {
    messaging.available.mockResolvedValue(false);

    store.start();

    await vi.waitFor(() => expect(messaging.available).toHaveBeenCalled());
    expect(store.supported()).toBe(false);
  });

  it('should register the token again when push was on before', async () => {
    localStorage.setItem('coach.push.token', 't1');
    messaging.permission = 'granted';
    messaging.createToken.mockResolvedValue('t1');
    store = createStore();

    store.start();

    await vi.waitFor(() => expect(deviceTokens.register).toHaveBeenCalledWith('t1'));
    expect(deviceTokens.unregister).not.toHaveBeenCalled();
  });

  it('should drop the old token when the browser gives a new one', async () => {
    localStorage.setItem('coach.push.token', 'old');
    messaging.permission = 'granted';
    messaging.createToken.mockResolvedValue('new');
    store = createStore();

    store.start();

    await vi.waitFor(() => expect(deviceTokens.unregister).toHaveBeenCalledWith('old'));
    expect(deviceTokens.register).toHaveBeenCalledWith('new');
    expect(localStorage.getItem('coach.push.token')).toBe('new');
    expect(store.enabled()).toBe(true);
  });

  it('should keep push on when the old token is already gone', async () => {
    localStorage.setItem('coach.push.token', 'old');
    messaging.permission = 'granted';
    messaging.createToken.mockResolvedValue('new');
    deviceTokens.unregister.mockRejectedValue(new Error('not found'));
    store = createStore();

    store.start();

    await vi.waitFor(() => expect(deviceTokens.unregister).toHaveBeenCalledWith('old'));
    expect(localStorage.getItem('coach.push.token')).toBe('new');
    expect(store.enabled()).toBe(true);
  });

  it('should open the screen of a tapped push', () => {
    store.start();

    events.next({
      opened: true,
      data: { source: 'chat', conversationId: 'c1' },
      notice: null,
    });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/chat/c/c1');
  });

  it('should warn about a failed video in front without moving', () => {
    store.start();

    events.next({ opened: false, data: { source: 'video', type: '14' }, notice: null });

    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(notifications.failure).toHaveBeenCalledWith('coachApp.push.videoFailed');
  });

  it('should show the title and body of a push that arrives in front', () => {
    store.start();

    events.next({
      opened: false,
      data: {},
      notice: { title: 'Stage push test', body: 'Hello' },
    });

    expect(notifications.announce).toHaveBeenCalledWith('Stage push test', 'Hello');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should show nothing for a push that arrives in front without a title', () => {
    store.start();

    events.next({ opened: false, data: {}, notice: null });

    expect(notifications.announce).not.toHaveBeenCalled();
    expect(notifications.failure).not.toHaveBeenCalled();
  });

  it('should warn instead of showing the text when a failed video arrives in front', () => {
    store.start();

    events.next({
      opened: false,
      data: { source: 'video', type: '14' },
      notice: { title: 'Video failed', body: 'Try again' },
    });

    expect(notifications.failure).toHaveBeenCalledWith('coachApp.push.videoFailed');
    expect(notifications.announce).not.toHaveBeenCalled();
  });

  it('should not show the text again when the coach taps the system notification', () => {
    store.start();

    events.next({
      opened: true,
      data: { source: 'chat', conversationId: 'c1' },
      notice: { title: 'New message', body: 'Hi' },
    });

    expect(notifications.announce).not.toHaveBeenCalled();
  });
});
