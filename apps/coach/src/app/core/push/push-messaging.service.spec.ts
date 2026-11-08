import { TestBed } from '@angular/core/testing';
import { PushConfigService } from './push-config.service';
import { PushMessagingService, WorkerPushEvent } from './push-messaging.service';

describe('PushMessagingService.workerEvents', () => {
  const worker = new EventTarget();
  const originalDescriptor = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
  let received: WorkerPushEvent[];
  let subscription: { unsubscribe(): void };

  beforeEach(() => {
    Object.defineProperty(navigator, 'serviceWorker', { value: worker, configurable: true });
    TestBed.configureTestingModule({
      providers: [{ provide: PushConfigService, useValue: { load: vi.fn() } }],
    });
    received = [];
    subscription = TestBed.inject(PushMessagingService)
      .workerEvents()
      .subscribe((event) => received.push(event));
  });

  afterEach(() => {
    subscription.unsubscribe();
    if (originalDescriptor === undefined) {
      Reflect.deleteProperty(navigator, 'serviceWorker');
    } else {
      Object.defineProperty(navigator, 'serviceWorker', originalDescriptor);
    }
  });

  function post(message: unknown): void {
    worker.dispatchEvent(new MessageEvent('message', { data: message }));
  }

  it('should pass the title and body of a push when the worker sends them', () => {
    post({
      kind: 'push-received',
      data: JSON.stringify({ source: 'chat' }),
      title: 'New message',
      body: 'Hi',
    });

    expect(received).toEqual([
      {
        opened: false,
        data: { source: 'chat' },
        notice: { title: 'New message', body: 'Hi' },
      },
    ]);
  });

  it('should pass no notice when the worker sends a push without a title', () => {
    post({ kind: 'push-received', data: '{}' });

    expect(received).toEqual([{ opened: false, data: {}, notice: null }]);
  });

  it('should mark the event as opened when the worker reports a tapped notification', () => {
    post({ kind: 'push-open', data: JSON.stringify({ source: 'chat', conversationId: 'c1' }) });

    expect(received).toEqual([
      { opened: true, data: { source: 'chat', conversationId: 'c1' }, notice: null },
    ]);
  });

  it('should ignore a message that is not from the push worker', () => {
    post({ kind: 'something-else', data: '{}' });
    post('plain text');

    expect(received).toEqual([]);
  });
});
