import { TestBed } from '@angular/core/testing';
import { FileDownloadService } from './file-download.service';

describe('FileDownloadService', () => {
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    createObjectURL = vi.fn().mockReturnValue('blob:links');
    revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should click a link named after the file and release the url when saving', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockReturnValue(undefined);
    const content = new Blob(['x']);

    TestBed.inject(FileDownloadService).save({ content, fileName: 'links.xlsx' });

    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(createObjectURL).toHaveBeenCalledWith(content);
    expect(link.download).toBe('links.xlsx');
    expect(link.getAttribute('href')).toBe('blob:links');
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:links');
  });
});
