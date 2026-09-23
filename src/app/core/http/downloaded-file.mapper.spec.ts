import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { fileNameOf, toDownloadedFile, withReadableBody } from './downloaded-file.mapper';

describe('fileNameOf', () => {
  it('should prefer the encoded name when both names are sent', () => {
    expect(
      fileNameOf("attachment; filename=links.xlsx; filename*=UTF-8''garment%20links-20260923.xlsx"),
    ).toBe('garment links-20260923.xlsx');
  });

  it('should read the plain name when it is quoted', () => {
    expect(fileNameOf('attachment; filename="garment-links.xlsx"')).toBe('garment-links.xlsx');
  });

  it('should return null when the header has no name', () => {
    expect(fileNameOf('attachment')).toBeNull();
    expect(fileNameOf(null)).toBeNull();
  });
});

describe('toDownloadedFile', () => {
  it('should use the fallback name when the header is missing', () => {
    const content = new Blob(['x']);

    const file = toDownloadedFile(new HttpResponse({ body: content }), 'fallback.xlsx');

    expect(file).toEqual({ content, fileName: 'fallback.xlsx' });
  });

  it('should use the server name when the header carries one', () => {
    const response = new HttpResponse({
      body: new Blob(['x']),
      headers: new HttpHeaders({ 'Content-Disposition': 'attachment; filename=server.xlsx' }),
    });

    expect(toDownloadedFile(response, 'fallback.xlsx').fileName).toBe('server.xlsx');
  });
});

describe('withReadableBody', () => {
  it('should parse the problem details when the error body is a blob', async () => {
    const problem = { title: 'Garment.NotFound', detail: 'gone' };
    const error = new HttpErrorResponse({
      status: 404,
      error: new Blob([JSON.stringify(problem)], { type: 'application/json' }),
    });

    const readable = await withReadableBody(error);

    expect(readable).toBeInstanceOf(HttpErrorResponse);
    expect((readable as HttpErrorResponse).error).toEqual(problem);
    expect((readable as HttpErrorResponse).status).toBe(404);
  });

  it('should drop the body when the blob is not json', async () => {
    const error = new HttpErrorResponse({ status: 500, error: new Blob(['<html>']) });

    expect(((await withReadableBody(error)) as HttpErrorResponse).error).toBeNull();
  });

  it('should keep the error when it is not an http error', async () => {
    const error = new Error('offline');

    await expect(withReadableBody(error)).resolves.toBe(error);
  });
});
