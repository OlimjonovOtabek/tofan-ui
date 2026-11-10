import { Post, appendPosts, hasMorePosts, isPostEdited, postDateLabel, withoutPost } from './post';

function post(id: string, created = '2026-11-08T09:00:00', updated = created): Post {
  return {
    id,
    authorName: 'Aziz Karimov',
    authorInitials: 'AK',
    authorPhotoUrl: null,
    title: 'Bu hafta',
    text: '',
    fileId: null,
    createdOn: new Date(created),
    updatedOn: new Date(updated),
    video: null,
  };
}

describe('post rules', () => {
  it('should call a post edited when it changed more than a minute after it came out', () => {
    expect(isPostEdited(post('a', '2026-11-08T09:00:00', '2026-11-08T09:00:30'))).toBe(false);
    expect(isPostEdited(post('a', '2026-11-08T09:00:00', '2026-11-08T09:02:00'))).toBe(true);
  });

  it('should show only the time when the post came out today', () => {
    const now = new Date('2026-11-08T18:00:00');
    expect(postDateLabel(new Date('2026-11-08T09:05:00'), now, 'en')).toBe('09:05');
  });

  it('should show the day and time when the post came out this year', () => {
    const now = new Date('2026-11-08T18:00:00');
    expect(postDateLabel(new Date('2026-03-02T07:30:00'), now, 'uz')).toBe('2 mar, 07:30');
  });

  it('should show the full date when the post came out in an earlier year', () => {
    const now = new Date('2026-11-08T18:00:00');
    expect(postDateLabel(new Date('2025-03-02T07:30:00'), now, 'en')).toBe('2 March 2025');
  });

  it('should append the next page without repeating a post', () => {
    expect(appendPosts([post('a'), post('b')], [post('b'), post('c')]).map((p) => p.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('should have more posts when fewer are shown than the total', () => {
    expect(hasMorePosts({ posts: [post('a')], totalCount: 2 })).toBe(true);
    expect(hasMorePosts({ posts: [post('a')], totalCount: 1 })).toBe(false);
  });

  it('should drop a deleted post and count one less', () => {
    const page = withoutPost({ posts: [post('a'), post('b')], totalCount: 5 }, 'a');
    expect(page.posts.map((p) => p.id)).toEqual(['b']);
    expect(page.totalCount).toBe(4);
    expect(withoutPost(page, 'x').totalCount).toBe(4);
  });
});
