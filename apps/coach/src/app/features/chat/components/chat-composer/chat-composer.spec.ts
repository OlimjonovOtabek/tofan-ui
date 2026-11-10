import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LocaleStore } from '@core/i18n/locale.store';
import { ChatComposerStore, PickKind } from '../../chat-composer.store';
import { PickedFile } from '../../models/chat-outbox';
import { RecordingState } from '../../models/recording';
import { ChatComposer } from './chat-composer';

function createFakeStore() {
  const draft = signal('');
  const picked = signal<readonly PickedFile[]>([]);
  return {
    draft,
    picked,
    pickedKind: signal<PickKind | null>(null),
    recording: signal<RecordingState | null>(null),
    videoNote: signal<RecordingState | null>(null),
    videoStream: signal<MediaStream | null>(null),
    videoNoteMaxMs: 60_000,
    maxAttachments: 10,
    hasPicked: computed(() => picked().length > 0),
    canSend: computed(() => draft().trim() !== ''),
    showsMicrophone: computed(() => draft().trim() === ''),
    setDraft: vi.fn((text: string) => draft.set(text)),
    pick: vi.fn(),
    remove: vi.fn(),
    send: vi.fn(),
    startRecording: vi.fn(),
    finishRecording: vi.fn(),
    cancelRecording: vi.fn(),
    startVideoNote: vi.fn(),
    finishVideoNote: vi.fn(),
    cancelVideoNote: vi.fn(),
  };
}

describe('ChatComposer', () => {
  let store: ReturnType<typeof createFakeStore>;

  beforeEach(() => {
    store = createFakeStore();
    TestBed.configureTestingModule({
      providers: [{ provide: ChatComposerStore, useValue: store }],
    });
    TestBed.inject(LocaleStore).setLocale('en');
  });

  function render() {
    const fixture = TestBed.createComponent(ChatComposer);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const textarea = host.querySelector('textarea');
    if (textarea === null) {
      throw new Error('The text field is not shown.');
    }
    return { fixture, host, textarea };
  }

  function paste(target: HTMLElement, files: File[]): Event {
    const event = new Event('paste', { cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { files } });
    target.dispatchEvent(event);
    return event;
  }

  it('should take only pasted images and keep plain text pastes', () => {
    const { textarea } = render();
    const image = new File(['x'], 'shot.png', { type: 'image/png' });

    const withImage = paste(textarea, [image, new File(['x'], 'a.txt', { type: 'text/plain' })]);
    const withText = paste(textarea, []);

    expect(store.pick).toHaveBeenCalledWith('image', [image]);
    expect(store.pick).toHaveBeenCalledTimes(1);
    expect(withImage.defaultPrevented).toBe(true);
    expect(withText.defaultPrevented).toBe(false);
  });

  it('should send on Enter but not on Shift+Enter or while composing', () => {
    const { textarea } = render();

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }));
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true }));
    expect(store.send).not.toHaveBeenCalled();

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(store.send).toHaveBeenCalledTimes(1);
  });

  it('should open the attach menu and close it on a click outside', () => {
    const { fixture, host } = render();

    host.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')?.click();
    fixture.detectChanges();
    expect(host.querySelectorAll('.menu .item')).toHaveLength(3);
    expect(host.querySelector('.menu')?.textContent).toContain('up to 10');

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    fixture.detectChanges();
    expect(host.querySelector('.menu')).toBeNull();
  });

  it('should pick the chosen files and clear the input for the next choice', () => {
    const { host } = render();
    const input = host.querySelectorAll<HTMLInputElement>('input[type="file"]')[1];
    const file = new File(['x'], 'plan.pdf');
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });

    input.dispatchEvent(new Event('change'));

    expect(store.pick).toHaveBeenCalledWith('file', [file]);
    expect(input.value).toBe('');
  });

  it('should show the microphone for an empty draft and the send button for text', () => {
    const { fixture, host } = render();
    expect(host.querySelector('[aria-label="Record a voice message"]')).not.toBeNull();

    store.draft.set('salom');
    fixture.detectChanges();

    expect(host.querySelector('[aria-label="Record a voice message"]')).toBeNull();
    expect(host.querySelector('button[type="submit"]')).not.toBeNull();
  });

  it('should start a round video from the attach menu', () => {
    const { fixture, host } = render();
    host.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')?.click();
    fixture.detectChanges();

    const item = host.querySelectorAll<HTMLButtonElement>('.menu .item')[2];
    expect(item.textContent).toContain('up to 60 s');
    item.click();
    fixture.detectChanges();

    expect(store.startVideoNote).toHaveBeenCalledTimes(1);
    expect(host.querySelector('.menu')).toBeNull();
  });

  it('should show the round video recorder while a video note is recording', async () => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    const { fixture, host } = render();

    store.videoNote.set({ elapsedMs: 15_000, levels: [] });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.querySelector('coach-video-note-recorder .clock')?.textContent).toContain(
      '0:15 / 1:00',
    );
    host.querySelector<HTMLButtonElement>('coach-video-note-recorder .send')?.click();
    expect(store.finishVideoNote).toHaveBeenCalledTimes(1);
  });
});
