import { FileCategory } from '@domain/storage/file-category';
import { ensureUploadIsAllowed } from '@domain/storage/file-upload-rules';
import { FileRepository } from '@domain/storage/repositories/file.repository';

export class UploadFileUseCase {
  constructor(private readonly fileRepository: FileRepository) {}

  /**
   * @returns id of the stored file.
   * @throws BusinessRuleError when the file breaks the size or type rules.
   */
  execute(
    file: File,
    category: FileCategory,
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    ensureUploadIsAllowed(file.name, file.size, category);
    return this.fileRepository.upload({ file, category, onProgress });
  }
}
