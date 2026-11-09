import { TestBed } from '@angular/core/testing';
import { LocaleStore } from '@core/i18n/locale.store';
import { Attachment } from '../../models/chat-attachment';
import { ImageGallery } from './image-gallery';

const image = (fileId: string): Attachment => ({
  fileId,
  url: `/api/files/${fileId}/content`,
  fileName: `${fileId}.jpg`,
  contentType: 'image/jpeg',
  sizeBytes: 1,
  durationSeconds: null,
  width: 100,
  height: 100,
  waveform: [],
});

describe('ImageGallery', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.dispatchEvent(new Event('close'));
    });
    TestBed.inject(LocaleStore).setLocale('en');
  });

  async function render() {
    const fixture = TestBed.createComponent(ImageGallery);
    fixture.componentRef.setInput('attachments', [image('a'), image('b'), image('c')]);
    fixture.componentRef.setInput('startIndex', 2);
    fixture.componentRef.setInput('title', 'Aziz');
    fixture.componentRef.setInput('subtitle', '09:13');
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, host };
  }

  it('should open at the start image and show its position', async () => {
    const { host } = await render();

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(host.querySelector('.photo')?.getAttribute('src')).toContain('/c/');
    expect(host.querySelector('.muted')?.textContent).toContain('3 of 3');
  });

  it('should wrap around with the arrow keys', async () => {
    const { fixture, host } = await render();
    const dialog = host.querySelector('dialog');

    dialog?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(host.querySelector('.photo')?.getAttribute('src')).toContain('/a/');

    dialog?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(host.querySelector('.photo')?.getAttribute('src')).toContain('/c/');
  });

  it('should ask to download the current image and report when it closes', async () => {
    const { fixture, host } = await render();
    const downloaded: Attachment[] = [];
    let closed = false;
    fixture.componentInstance.downloaded.subscribe((attachment) => downloaded.push(attachment));
    fixture.componentInstance.closed.subscribe(() => (closed = true));

    host.querySelector<HTMLButtonElement>('[aria-label="Download"]')?.click();
    host.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click();

    expect(downloaded.map((item) => item.fileId)).toEqual(['c']);
    expect(closed).toBe(true);
  });
});
