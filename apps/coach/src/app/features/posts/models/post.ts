import { AppLocale } from '@core/i18n/locale';
import { formatDayMonthLong, formatDayMonthTime, formatTime } from '@coach/core/format/formats';
import { VideoSource } from '@coach/core/videos/video';

export const POST_TITLE_MAX = 200;
export const POST_TEXT_MAX = 4000;
export const POSTS_PAGE_SIZE = 10;
export const POSTS_UPLOAD_GROUP = 'trainer-posts';
export const POSTS_LINK = '/profile/posts';

const EDITED_AFTER_MS = 60_000;

export interface Post {
  readonly id: string;
  readonly authorName: string;
  readonly authorInitials: string;
  readonly authorPhotoUrl: string | null;
  readonly title: string;
  readonly text: string;
  readonly fileId: string | null;
  readonly createdOn: Date;
  readonly updatedOn: Date;
  readonly video: VideoSource | null;
}

export interface PostsPage {
  readonly posts: readonly Post[];
  readonly totalCount: number;
}

export function isPostEdited(post: Post): boolean {
  return post.updatedOn.getTime() - post.createdOn.getTime() > EDITED_AFTER_MS;
}

export function postDateLabel(created: Date, now: Date, locale: AppLocale): string {
  if (isSameDay(created, now)) {
    return formatTime(created);
  }
  if (created.getFullYear() === now.getFullYear()) {
    return formatDayMonthTime(created, locale);
  }
  return formatDayMonthLong(created, locale, true);
}

export function appendPosts(shown: readonly Post[], next: readonly Post[]): Post[] {
  const known = new Set(shown.map((post) => post.id));
  return [...shown, ...next.filter((post) => !known.has(post.id))];
}

export function hasMorePosts(page: PostsPage): boolean {
  return page.posts.length < page.totalCount;
}

export function withoutPost(page: PostsPage, id: string): PostsPage {
  const posts = page.posts.filter((post) => post.id !== id);
  return { posts, totalCount: page.totalCount - (page.posts.length - posts.length) };
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
