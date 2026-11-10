import { TestBed } from '@angular/core/testing';
import { Translator } from '@core/i18n/translator';
import { Post } from '../../models/post';
import { PostCard } from './post-card';

const post: Post = {
  id: 'p1',
  authorName: 'Aziz Karimov',
  authorInitials: 'AK',
  authorPhotoUrl: null,
  title: 'Bu hafta',
  text: 'Ko‘proq suv iching',
  fileId: 'f1',
  createdOn: new Date('2026-11-08T09:00:00'),
  updatedOn: new Date('2026-11-08T09:30:00'),
  video: { videoUrl: '/v.mp4', hlsUrl: null, posterUrl: null },
};

describe('PostCard', () => {
  function render(value: Post, status: 'pending' | 'ready' | null = null) {
    const fixture = TestBed.createComponent(PostCard);
    fixture.componentRef.setInput('post', value);
    fixture.componentRef.setInput('now', new Date('2026-11-08T18:00:00'));
    fixture.componentRef.setInput('locale', 'en');
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  function edited(): string {
    return TestBed.inject(Translator).translate('coachApp.posts.edited');
  }

  it('should show the author, time, edited mark, title, text and video', () => {
    const { element } = render(post);

    expect(element.textContent).toContain('Aziz Karimov');
    expect(element.textContent).toContain('09:00');
    expect(element.textContent).toContain(edited());
    expect(element.querySelector('h3')?.textContent).toContain('Bu hafta');
    expect(element.textContent).toContain('Ko‘proq suv iching');
    expect(element.querySelector('coach-video-preview')).not.toBeNull();
  });

  it('should show no video and no edited mark for an untouched text post', () => {
    const { element } = render({ ...post, video: null, fileId: null, updatedOn: post.createdOn });

    expect(element.querySelector('coach-video-preview')).toBeNull();
    expect(element.textContent).not.toContain(edited());
  });

  it('should tag a video that is still being processed only', () => {
    expect(render(post, 'pending').element.querySelector('coach-video-status-tag')).not.toBeNull();
    expect(render(post, 'ready').element.querySelector('coach-video-status-tag')).toBeNull();
  });

  it('should ask to watch and to open the actions', () => {
    const { fixture, element } = render(post);
    const watched = vi.fn();
    const opened = vi.fn();
    fixture.componentInstance.watch.subscribe(watched);
    fixture.componentInstance.more.subscribe(opened);

    element.querySelector<HTMLButtonElement>('coach-video-preview button')?.click();
    element.querySelector<HTMLButtonElement>('.more')?.click();

    expect(watched).toHaveBeenCalled();
    expect(opened).toHaveBeenCalled();
  });
});
