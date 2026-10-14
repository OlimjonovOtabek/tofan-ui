import { HttpResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/http/api-base-url';
import { isUploadCancelled } from './file-upload-request';
import { FileUploadService } from './file-upload.service';

describe('FileUploadService', () => {
  let http: HttpTestingController;
  let service: FileUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(FileUploadService);
  });

  it('should abort the request and reject as cancelled when the task is cancelled', async () => {
    const task = service.startUpload({ file: new File(['x'], 'a.png'), category: 'avatar' });
    const request = http.expectOne('/api/files');

    task.cancel();

    await expect(task.result).rejects.toSatisfy(isUploadCancelled);
    expect(request.cancelled).toBe(true);
  });

  it('should ignore cancel after the upload has completed', async () => {
    const task = service.startUpload({ file: new File(['x'], 'a.png'), category: 'avatar' });
    http.expectOne('/api/files').event(
      new HttpResponse({ body: { isSuccess: true, data: 'file-1' }, status: 200 }),
    );

    task.cancel();

    await expect(task.result).resolves.toBe('file-1');
  });
});
