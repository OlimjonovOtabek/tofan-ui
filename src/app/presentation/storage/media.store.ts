import { Injectable, computed, inject, signal } from '@angular/core';
import { DeleteFileUseCase } from '@application/storage/delete-file.use-case';
import { FindFileUsagesUseCase } from '@application/storage/find-file-usages.use-case';
import { GetFileContentUrlUseCase } from '@application/storage/get-file-content-url.use-case';
import { GetFilesUseCase } from '@application/storage/get-files.use-case';
import { Page, PageRequest, emptyPage, firstPage } from '@domain/shared/paging/page';
import { StoredFile } from '@domain/storage/entities/stored-file';
import { FileUsage } from '@domain/storage/file-usage';
import { NotificationService } from '@presentation/shared/feedback/notification.service';

/** View state of the media library: one page of stored files and the operations on them. */
@Injectable()
export class MediaStore {
  private readonly getFilesUseCase = inject(GetFilesUseCase);
  private readonly deleteFileUseCase = inject(DeleteFileUseCase);
  private readonly findUsagesUseCase = inject(FindFileUsagesUseCase);
  private readonly contentUrlUseCase = inject(GetFileContentUrlUseCase);
  private readonly notifications = inject(NotificationService);

  private readonly page = signal<Page<StoredFile>>(emptyPage<StoredFile>());
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly files = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly first = computed(() => this.currentRequest().first);
  /** Id of the file whose references are being looked up before a delete. */
  readonly checkingUsagesOf = signal<string | null>(null);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    try {
      this.page.set(await this.getFilesUseCase.execute(request));
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.loading.set(false);
    }
  }

  contentUrl(file: StoredFile): string {
    return this.contentUrlUseCase.execute(file.id);
  }

  /** @returns the records pointing at the file, or `null` when the lookup itself failed. */
  async findUsages(file: StoredFile): Promise<readonly FileUsage[] | null> {
    this.checkingUsagesOf.set(file.id);
    try {
      return await this.findUsagesUseCase.execute(file.id);
    } catch (error) {
      this.notifications.error(error);
      return null;
    } finally {
      this.checkingUsagesOf.set(null);
    }
  }

  async remove(file: StoredFile): Promise<void> {
    try {
      await this.deleteFileUseCase.execute(file.id);
      this.notifications.success(`"${file.displayName}" o'chirildi.`);
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }
}
