import { TestBed } from '@angular/core/testing';
import { LocaleStore } from '@core/i18n/locale.store';
import { ChatPlaybackStore } from '../../chat-playback.store';
import { VideoNote } from './video-note';

describe('VideoNote', () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    TestBed.configureTestingModule({ providers: [ChatPlaybackStore] });
    TestBed.inject(LocaleStore).setLocale('en');
  });

  afterEach(() => vi.restoreAllMocks());

  function render() {
    const fixture = TestBed.createComponent(VideoNote);
    fixture.componentRef.setInput('attachment', {
      fileId: 'v1',
      url: '/api/files/v1/content',
      fileName: 'note.mp4',
      contentType: 'video/mp4',
      sizeBytes: 1,
      durationSeconds: 24,
      width: 480,
      height: 480,
      waveform: [],
    });
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const video = host.querySelector('video');
    if (video === null) {
      throw new Error('The video is not shown.');
    }
    return { fixture, host, video };
  }

  it('should preview muted in a loop and show the duration', () => {
    const { host, video } = render();

    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(host.querySelector('.clock')?.textContent?.trim()).toBe('0:24');
  });

  it('should play from the start with sound on click and go back to the preview on a second click', () => {
    const { fixture, host, video } = render();

    host.querySelector<HTMLButtonElement>('.note')?.click();
    fixture.detectChanges();
    expect(video.muted).toBe(false);
    expect(host.querySelector('.clock')?.textContent?.trim()).toBe('0:00 / 0:24');

    host.querySelector<HTMLButtonElement>('.note')?.click();
    fixture.detectChanges();
    expect(video.muted).toBe(true);
  });

  it('should go back to the preview when another player takes over', () => {
    const { fixture, host, video } = render();
    host.querySelector<HTMLButtonElement>('.note')?.click();
    fixture.detectChanges();

    TestBed.inject(ChatPlaybackStore).claim('other');
    fixture.detectChanges();

    expect(video.muted).toBe(true);
  });
});
