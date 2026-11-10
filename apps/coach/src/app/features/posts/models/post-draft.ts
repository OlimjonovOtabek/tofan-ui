import { VideoSource } from '@coach/core/videos/video';
import { Post } from './post';

export interface PostDraft {
  readonly title: string;
  readonly text: string;
}

export type PostVideo =
  | { readonly kind: 'none' }
  | { readonly kind: 'stored'; readonly fileId: string; readonly source: VideoSource }
  | { readonly kind: 'picked'; readonly file: File; readonly source: VideoSource };

export const NO_POST_VIDEO: PostVideo = { kind: 'none' };

export function postDraftOf(post: Post | null): PostDraft {
  return { title: post?.title ?? '', text: post?.text ?? '' };
}

export function postVideoOf(post: Post | null): PostVideo {
  if (post?.fileId === null || post?.fileId === undefined || post.video === null) {
    return NO_POST_VIDEO;
  }
  return { kind: 'stored', fileId: post.fileId, source: post.video };
}

export function pickedPostVideo(file: File, localUrl: string | null): PostVideo {
  return {
    kind: 'picked',
    file,
    source: { videoUrl: null, hlsUrl: null, posterUrl: null, localUrl },
  };
}

export function hasPostContent(draft: PostDraft, video: PostVideo): boolean {
  return draft.text.trim().length > 0 || video.kind !== 'none';
}

export function storedFileIdOf(video: PostVideo): string | null {
  return video.kind === 'stored' ? video.fileId : null;
}
