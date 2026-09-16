import { FileRepository } from '@domain/storage/repositories/file.repository';

export class GetFileContentUrlUseCase {
  constructor(private readonly fileRepository: FileRepository) {}

  /** The content endpoint is anonymous, so the URL works directly in `img`, `video` and links. */
  execute(id: string): string {
    return this.fileRepository.contentUrl(id);
  }
}
