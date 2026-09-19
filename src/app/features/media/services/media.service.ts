import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPage, toPagedQuery } from '@core/http/paging.mapper';
import { Page, PageRequest } from '@shared/models/page';
import { StoredFile } from '../models/stored-file';
import { StoredFileResponse } from './stored-file.dto';
import { toStoredFile } from './stored-file.mapper';

const FILES = '/files';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly apiClient = inject(ApiClient);

  async list(page: PageRequest): Promise<Page<StoredFile>> {
    const list = await this.apiClient.get<PagedList<StoredFileResponse>>(FILES, toPagedQuery(page));
    return toPage(list, toStoredFile);
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.delete(filePath(id));
  }

  contentUrl(id: string): string {
    return this.apiClient.url(`${filePath(id)}/content`);
  }
}

function filePath(id: string): string {
  return `${FILES}/${encodeURIComponent(id)}`;
}
