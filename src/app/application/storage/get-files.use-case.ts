import { Page, PageRequest } from '@domain/shared/paging/page';
import { StoredFile } from '@domain/storage/entities/stored-file';
import { FileRepository } from '@domain/storage/repositories/file.repository';

export class GetFilesUseCase {
  constructor(private readonly fileRepository: FileRepository) {}

  execute(page: PageRequest): Promise<Page<StoredFile>> {
    return this.fileRepository.list(page);
  }
}
