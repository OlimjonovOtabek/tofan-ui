import { FileRepository } from '@domain/storage/repositories/file.repository';

export class DeleteFileUseCase {
  constructor(private readonly fileRepository: FileRepository) {}

  /** Deletes the record and the bytes; check `FindFileUsagesUseCase` first. */
  execute(id: string): Promise<void> {
    return this.fileRepository.delete(id);
  }
}
