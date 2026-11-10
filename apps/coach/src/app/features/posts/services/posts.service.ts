import { Injectable, inject } from '@angular/core';
import { PagedList } from '@core/http/api.dto';
import { ApiClient } from '@core/http/api-client';
import { POSTS_PAGE_SIZE, PostsPage } from '../models/post';
import { PostDraft } from '../models/post-draft';
import { TrainerPostResponse } from './post.dto';
import { PostUrls, toPost, toSavePostRequest } from './post.mapper';

const POSTS = '/coach/posts';
const FILES = '/files';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly api = inject(ApiClient);
  private readonly urls: PostUrls = {
    fileContent: (fileId) => this.api.url(`${FILES}/${encodeURIComponent(fileId)}/content`),
    media: (path) => (path ? this.api.url(path) : null),
  };

  async list(first: number): Promise<PostsPage> {
    const page = await this.api.get<PagedList<TrainerPostResponse>>(POSTS, {
      First: first,
      Rows: POSTS_PAGE_SIZE,
    });
    return {
      posts: page.data.map((response) => toPost(response, this.urls)),
      totalCount: page.totalCount,
    };
  }

  create(draft: PostDraft, fileId: string | null): Promise<string> {
    return this.api.post<string>(POSTS, toSavePostRequest(draft, fileId));
  }

  async update(id: string, draft: PostDraft, fileId: string | null): Promise<void> {
    await this.api.put(`${POSTS}/${encodeURIComponent(id)}`, toSavePostRequest(draft, fileId));
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`${POSTS}/${encodeURIComponent(id)}`);
  }
}
