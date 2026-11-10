import { TestBed } from '@angular/core/testing';
import { LocaleStore } from '@core/i18n/locale.store';
import { PickedFile } from '../../models/chat-outbox';
import { ComposerTray } from './composer-tray';

const picked = (name: string): PickedFile => ({
  id: name,
  file: new File(['x'], name),
  previewUrl: `blob:${name}`,
});

describe('ComposerTray', () => {
  beforeEach(() => TestBed.inject(LocaleStore).setLocale('en'));

  function render(files: PickedFile[], images: boolean, max = 10) {
    const fixture = TestBed.createComponent(ComposerTray);
    fixture.componentRef.setInput('picked', files);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('max', max);
    fixture.detectChanges();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  it('should show thumbnails, the count and an add tile for images', () => {
    const { host } = render([picked('a.jpg'), picked('b.jpg')], true);

    expect(host.querySelectorAll('.thumb img')).toHaveLength(2);
    expect(host.querySelector('.add')).not.toBeNull();
    expect(host.querySelector('.count')?.textContent?.trim()).toBe('2 / 10');
  });

  it('should show rows with the extension for files and hide adding at the limit', () => {
    const { host } = render([picked('plan.pdf'), picked('README')], false, 2);

    expect(host.querySelectorAll('.file')).toHaveLength(2);
    expect(host.querySelector('coach-file-badge')?.textContent?.trim()).toBe('PDF');
    expect(host.querySelectorAll('coach-file-badge coach-icon')).toHaveLength(1);
    expect(host.querySelector('.add-row')).toBeNull();
  });

  it('should report which file to remove and when more are wanted', () => {
    const { fixture, host } = render([picked('a.jpg')], true);
    const removed: string[] = [];
    let added = 0;
    fixture.componentInstance.removed.subscribe((id) => removed.push(id));
    fixture.componentInstance.added.subscribe(() => added++);

    host.querySelector<HTMLButtonElement>('.remove')?.click();
    host.querySelector<HTMLButtonElement>('.add')?.click();

    expect(removed).toEqual(['a.jpg']);
    expect(added).toBe(1);
  });
});
