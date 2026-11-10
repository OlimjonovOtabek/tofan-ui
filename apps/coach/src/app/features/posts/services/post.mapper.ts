import { initialsOf } from '@coach/core/clients/client-activity';
import { PostDraft } from '../models/post-draft';
import { Post } from '../models/post';
import { SaveTrainerPostRequest, TrainerPostResponse } from './post.dto';

export interface PostUrls {
  readonly fileContent: (fileId: string) => string;
  readonly media: (path: string | null) => string | null;
}

export function toPost(response: TrainerPostResponse, urls: PostUrls): Post {
  const videoUrl = urls.media(response.videoUrl);
  const hlsUrl = urls.media(response.hlsUrl);
  const authorName = response.trainerDisplayName.trim();
  return {
    id: response.id,
    authorName,
    authorInitials: initialsOfName(authorName),
    authorPhotoUrl: response.trainerPhotoFileId
      ? urls.fileContent(response.trainerPhotoFileId)
      : null,
    title: response.title.trim(),
    text: response.text?.trim() ?? '',
    fileId: response.fileId,
    createdOn: new Date(response.createdOnUtc),
    updatedOn: new Date(response.updatedOnUtc),
    video:
      videoUrl === null && hlsUrl === null
        ? null
        : { videoUrl, hlsUrl, posterUrl: urls.media(response.posterUrl) },
  };
}

export function toSavePostRequest(draft: PostDraft, fileId: string | null): SaveTrainerPostRequest {
  const text = draft.text.trim();
  return { title: draft.title.trim(), text: text === '' ? null : text, fileId };
}

function initialsOfName(name: string): string {
  const words = name.split(/\s+/).filter((word) => word.length > 0);
  return initialsOf(words[0], words.length > 1 ? words[words.length - 1] : null);
}
