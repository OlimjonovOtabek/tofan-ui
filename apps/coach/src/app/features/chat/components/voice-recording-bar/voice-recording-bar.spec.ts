import { TestBed } from '@angular/core/testing';
import { LocaleStore } from '@core/i18n/locale.store';
import { VoiceRecordingBar } from './voice-recording-bar';

describe('VoiceRecordingBar', () => {
  beforeEach(() => TestBed.inject(LocaleStore).setLocale('en'));

  function render() {
    const fixture = TestBed.createComponent(VoiceRecordingBar);
    fixture.componentRef.setInput('state', { elapsedMs: 7400, levels: [80, 20] });
    fixture.detectChanges();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  it('should show the clock and pad the level bars to a full row', () => {
    const { host } = render();
    const levels = host.querySelectorAll<HTMLElement>('.level');

    expect(host.querySelector('.clock')?.textContent?.trim()).toBe('0:07');
    expect(levels).toHaveLength(48);
    expect(levels[0].style.height).toBe('12%');
    expect(levels[46].style.height).toBe('80%');
  });

  it('should cancel on the bin and on Escape and send on the arrow', () => {
    const { fixture, host } = render();
    let cancelled = 0;
    let sent = 0;
    fixture.componentInstance.cancelled.subscribe(() => cancelled++);
    fixture.componentInstance.sent.subscribe(() => sent++);

    host.querySelector<HTMLButtonElement>('.cancel')?.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    host.querySelector<HTMLButtonElement>('.send')?.click();

    expect(cancelled).toBe(2);
    expect(sent).toBe(1);
  });
});
