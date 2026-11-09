import { TestBed } from '@angular/core/testing';
import { LocaleStore } from '@core/i18n/locale.store';
import { ChatPlaybackStore } from '../../chat-playback.store';
import { Attachment } from '../../models/chat-attachment';
import { VoiceMessage } from './voice-message';

const voice = (fileId: string): Attachment => ({
  fileId,
  url: `/api/files/${fileId}/content`,
  fileName: 'voice.m4a',
  contentType: 'audio/mp4',
  sizeBytes: 1,
  durationSeconds: 10,
  width: null,
  height: null,
  waveform: [0, 50, 100],
});

describe('VoiceMessage', () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      this.dispatchEvent(new Event('play'));
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      this.dispatchEvent(new Event('pause'));
    });
    TestBed.configureTestingModule({ providers: [ChatPlaybackStore] });
    TestBed.inject(LocaleStore).setLocale('en');
  });

  afterEach(() => vi.restoreAllMocks());

  function render(fileId: string) {
    const fixture = TestBed.createComponent(VoiceMessage);
    fixture.componentRef.setInput('attachment', voice(fileId));
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, host };
  }

  it('should show sixty four bars and the duration before playing', () => {
    const { host } = render('a');

    expect(host.querySelectorAll('.bar')).toHaveLength(64);
    expect(host.querySelector('.clock')?.textContent?.trim()).toBe('0:10');
    expect(host.querySelector('.speed')).toBeNull();
  });

  it('should cycle the speed through one, one and a half and two', () => {
    const { fixture, host } = render('a');
    host.querySelector<HTMLButtonElement>('.play')?.click();
    fixture.detectChanges();
    const speed = () => host.querySelector<HTMLButtonElement>('.speed');

    expect(speed()?.textContent?.trim()).toBe('1×');
    speed()?.click();
    fixture.detectChanges();
    expect(speed()?.textContent?.trim()).toBe('1.5×');
    speed()?.click();
    speed()?.click();
    fixture.detectChanges();
    expect(speed()?.textContent?.trim()).toBe('1×');
  });

  it('should pause when another voice message starts', async () => {
    const first = render('a');
    const second = render('b');

    first.host.querySelector<HTMLButtonElement>('.play')?.click();
    second.host.querySelector<HTMLButtonElement>('.play')?.click();
    first.fixture.detectChanges();
    await first.fixture.whenStable();

    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(TestBed.inject(ChatPlaybackStore).active()).toBe('b');
  });

  it('should move the position when the coach seeks and reset it at the end', () => {
    const { fixture, host } = render('a');
    const seek = host.querySelector<HTMLInputElement>('.seek');
    if (seek === null) {
      throw new Error('The seek input is not shown.');
    }

    seek.value = '50';
    seek.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.querySelector('.clock')?.textContent?.trim()).toBe('0:05 / 0:10');

    host.querySelector('audio')?.dispatchEvent(new Event('ended'));
    fixture.detectChanges();
    expect(host.querySelector('.clock')?.textContent?.trim()).toBe('0:10');
  });
});
