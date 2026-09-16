import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { DeleteFileUseCase } from '@application/storage/delete-file.use-case';
import { FindFileUsagesUseCase } from '@application/storage/find-file-usages.use-case';
import { GetFileContentUrlUseCase } from '@application/storage/get-file-content-url.use-case';
import { GetFilesUseCase } from '@application/storage/get-files.use-case';
import { UploadFileUseCase } from '@application/storage/upload-file.use-case';
import { ExerciseRepository } from '@domain/exercises/repositories/exercise.repository';
import { FileRepository } from '@domain/storage/repositories/file.repository';
import { FakeFileRepository } from '@infrastructure/storage/fake-file.repository';
import { HttpFileRepository } from '@infrastructure/storage/http-file.repository';

export interface StorageProvidersOptions {
  readonly useMockApi: boolean;
}

export function provideStorage({ useMockApi }: StorageProvidersOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: FileRepository, useClass: useMockApi ? FakeFileRepository : HttpFileRepository },
    { provide: UploadFileUseCase, useFactory: () => new UploadFileUseCase(inject(FileRepository)) },
    { provide: GetFilesUseCase, useFactory: () => new GetFilesUseCase(inject(FileRepository)) },
    { provide: DeleteFileUseCase, useFactory: () => new DeleteFileUseCase(inject(FileRepository)) },
    {
      provide: GetFileContentUrlUseCase,
      useFactory: () => new GetFileContentUrlUseCase(inject(FileRepository)),
    },
    // Needs `provideExercises` in the same injector: exercises are what reference files today.
    {
      provide: FindFileUsagesUseCase,
      useFactory: () => new FindFileUsagesUseCase(inject(ExerciseRepository)),
    },
  ]);
}
