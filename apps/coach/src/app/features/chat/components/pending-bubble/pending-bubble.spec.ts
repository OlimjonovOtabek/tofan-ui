import { TestBed } from '@angular/core/testing';
import { LocaleStore } from '@core/i18n/locale.store';
import { PendingMessage } from '../../models/chat-outbox';
import { PendingBubble } from './pending-bubble';

const pending = (change: Partial<PendingMessage> = {}): PendingMessage => ({
  id: 'p1',
  kind: 'image',
  files: [
    { id: 'a', file: new File(['x'], 'a.jpg'), previewUrl: 'blob:a' },
    { id: 'b', file: new File(['x'], 'b.jpg'), previewUrl: 'blob:b' },
  ],
  caption: 'Leg day',
  durationSeconds: null,
  progress: 40,
  failure: null,
  ...change,
});

describe('PendingBubble', () => {
  beforeEach(() => TestBed.inject(LocaleStore).setLocale('en'));

  function render(value: PendingMessage) {
    const fixture = TestBed.createComponent(PendingBubble);
    fixture.componentRef.setInput('pending', value);
    fixture.detectChanges();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  it('should show the previews, the caption and the upload progress', () => {
    const { host } = render(pending());

    expect(host.querySelectorAll('.thumb img')).toHaveLength(2);
    expect(host.querySelector('.caption')?.textContent).toContain('Leg day');
    expect(host.querySelector('.label')?.textContent).toContain('Sending · 40%');
    expect(host.querySelector('.done')?.getAttribute('stroke-dashoffset')).toBe(
      String(2 * Math.PI * 20 * 0.6),
    );
  });

  it('should say it is still sending while the server converts the file', () => {
    const { host } = render(pending({ kind: 'voice', progress: 100, durationSeconds: 3 }));

    expect(host.querySelector('coach-spinner')).not.toBeNull();
    expect(host.querySelector('.voice')?.textContent).toContain('0:03');
  });

  it('should offer retry and discard when the send failed', () => {
    const { fixture, host } = render(pending({ failure: 'errors.classes.generic' }));
    let retried = 0;
    let discarded = 0;
    fixture.componentInstance.retried.subscribe(() => retried++);
    fixture.componentInstance.discarded.subscribe(() => discarded++);

    expect(host.querySelector('.label')?.textContent).toContain('Not sent');
    const actions = host.querySelectorAll<HTMLButtonElement>('.action');
    actions[0].click();
    actions[1].click();

    expect(retried).toBe(1);
    expect(discarded).toBe(1);
  });
});
