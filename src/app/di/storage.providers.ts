import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { UploadFileUseCase } from '@application/storage/upload-file.use-case';
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
  ]);
}
