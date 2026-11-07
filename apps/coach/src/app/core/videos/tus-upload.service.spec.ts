import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiClient } from '@core/http/api-client';
import { API_BASE_URL } from '@core/http/api-base-url';
import { isUploadCancelled } from '@shared/components/file-upload/file-upload-request';
import { TusUploadService } from './tus-upload.service';

const CHUNK = 8 * 1024 * 1024;
const BASE = '/api/files/uploads';
const URL_OF = `${BASE}/up1`;

const flushMicrotasks = () => new Promise<void>((resolve) => setTimeout(resolve));

describe('TusUploadService', () => {
  let service: TusUploadService;
  let http: HttpTestingController;
  let controller: AbortController;
  const onProgress = vi.fn();
  const fileOf = (size: number) => new File([new Uint8Array(size)], 'squat.mp4');

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        ApiClient,
      ],
    });
    service = TestBed.inject(TusUploadService);
    http = TestBed.inject(HttpTestingController);
    controller = new AbortController();
  });

  afterEach(() => {
    vi.useRealTimers();
    http.verify();
  });

  const start = (file: File) => service.upload({ file, onProgress, signal: controller.signal });

  const open = async () => {
    await flushMicrotasks();
    const request = http.expectOne(BASE);
    request.flush('', {
      status: 201,
      statusText: 'Created',
      headers: { Location: 'https://api.peaktofan.com/files/uploads/up1' },
    });
    return request.request;
  };

  const acceptChunk = async (offsetAfter: number) => {
    await flushMicrotasks();
    const request = http.expectOne(URL_OF);
    request.flush('', {
      status: 204,
      statusText: 'No Content',
      headers: { 'Upload-Offset': String(offsetAfter) },
    });
    return request.request;
  };

  const complete = async (fileId: string) => {
    await flushMicrotasks();
    const request = http.expectOne(`${URL_OF}/complete`);
    request.flush({ isSuccess: true, data: fileId });
    return request.request;
  };

  it('should open the upload, send it in 8 MB chunks and complete it', async () => {
    const size = CHUNK + 10;
    const result = start(fileOf(size));

    const opened = await open();
    expect(opened.headers.get('Upload-Length')).toBe(String(size));
    expect(opened.headers.get('Tus-Resumable')).toBe('1.0.0');
    expect(opened.headers.get('Upload-Metadata')).toBe(`filename ${btoa('squat.mp4')}`);
    const first = await acceptChunk(CHUNK);
    expect(first.method).toBe('PATCH');
    expect(first.headers.get('Upload-Offset')).toBe('0');
    expect(first.headers.get('Content-Type')).toBe('application/offset+octet-stream');
    expect((first.body as Blob).size).toBe(CHUNK);
    const second = await acceptChunk(size);
    expect(second.headers.get('Upload-Offset')).toBe(String(CHUNK));
    expect((second.body as Blob).size).toBe(10);
    const completed = await complete('f1');

    expect(completed.body).toEqual({ category: 1, fileName: 'squat.mp4' });
    await expect(result).resolves.toBe('f1');
    expect(onProgress).toHaveBeenLastCalledWith(1);
  });

  it('should read the offset and carry on after a dropped chunk', async () => {
    const result = start(fileOf(100));
    await open();
    await flushMicrotasks();
    vi.useFakeTimers();
    http.expectOne(URL_OF).flush('', { status: 503, statusText: 'Unavailable' });
    await vi.advanceTimersByTimeAsync(2000);
    vi.useRealTimers();
    await flushMicrotasks();
    const head = http.expectOne(URL_OF);
    expect(head.request.method).toBe('HEAD');
    head.flush('', { status: 200, statusText: 'OK', headers: { 'Upload-Offset': '40' } });

    const resumed = await acceptChunk(100);
    expect(resumed.headers.get('Upload-Offset')).toBe('40');
    expect((resumed.body as Blob).size).toBe(60);
    await complete('f1');

    await expect(result).resolves.toBe('f1');
  });

  it('should fail at once on an error that a retry cannot fix', async () => {
    const result = start(fileOf(100));
    await open();
    await flushMicrotasks();

    http.expectOne(URL_OF).flush('', { status: 400, statusText: 'Bad Request' });

    await expect(result).rejects.toBeDefined();
  });

  it('should resume the same file on another try', async () => {
    const file = fileOf(100);
    const first = start(file);
    await open();
    await flushMicrotasks();
    http.expectOne(URL_OF).flush('', { status: 400, statusText: 'Bad Request' });
    await expect(first).rejects.toBeDefined();

    const second = start(file);
    await flushMicrotasks();
    const head = http.expectOne(URL_OF);
    expect(head.request.method).toBe('HEAD');
    head.flush('', { status: 200, statusText: 'OK', headers: { 'Upload-Offset': '30' } });
    const chunk = await acceptChunk(100);
    expect(chunk.headers.get('Upload-Offset')).toBe('30');
    await complete('f2');

    await expect(second).resolves.toBe('f2');
  });

  it('should open a new upload when the old one is gone', async () => {
    const file = fileOf(100);
    const first = start(file);
    await open();
    await flushMicrotasks();
    http.expectOne(URL_OF).flush('', { status: 400, statusText: 'Bad Request' });
    await expect(first).rejects.toBeDefined();

    const second = start(file);
    await flushMicrotasks();
    http.expectOne(URL_OF).flush('', { status: 404, statusText: 'Not Found' });
    await open();
    const chunk = await acceptChunk(100);
    expect(chunk.headers.get('Upload-Offset')).toBe('0');
    await complete('f3');

    await expect(second).resolves.toBe('f3');
  });

  it('should reject as cancelled when aborted', async () => {
    const result = start(fileOf(100));
    await open();
    await flushMicrotasks();

    controller.abort();

    await expect(result).rejects.toSatisfy(isUploadCancelled);
    expect(http.expectOne(URL_OF).cancelled).toBe(true);
  });
});
