import {
  VideoUpload,
  VideoUploadStatus,
  isLostUpload,
  isVideoFileAccepted,
  isVideoTooLargeError,
  summarizeUploads,
} from './video-upload';

const upload = (id: string, status: VideoUploadStatus): VideoUpload => ({
  id,
  group: 'g',
  link: `/${id}`,
  status,
});

describe('video upload rules', () => {
  it('should have no summary when nothing is under way', () => {
    expect(summarizeUploads([upload('a', { kind: 'done', fileId: 'f' })], [])).toBeNull();
  });

  it('should show the preparing videos first', () => {
    const summary = summarizeUploads(
      [
        upload('a', { kind: 'compressing', progress: 0.5 }),
        upload('b', { kind: 'sending', progress: 0.9 }),
      ],
      [],
    );

    expect(summary).toEqual({ phase: 'preparing', progress: 0.5, count: 2, link: '/b' });
  });

  it('should average the sending videos', () => {
    const summary = summarizeUploads(
      [
        upload('a', { kind: 'sending', progress: 0.2 }),
        upload('b', { kind: 'sending', progress: 0.6 }),
      ],
      [],
    );

    expect(summary?.phase).toBe('sending');
    expect(summary?.progress).toBeCloseTo(0.4);
  });

  it('should show saving when only a queued save is left', () => {
    expect(summarizeUploads([], ['/programs'])).toEqual({
      phase: 'saving',
      progress: null,
      count: 0,
      link: '/programs',
    });
  });

  it('should lead to the queued save while its videos upload', () => {
    const summary = summarizeUploads(
      [upload('a', { kind: 'sending', progress: 0 })],
      ['/programs/workout/1'],
    );

    expect(summary?.link).toBe('/programs/workout/1');
  });

  it('should treat a missing, failed or too large upload as lost', () => {
    expect(isLostUpload(undefined)).toBe(true);
    expect(isLostUpload(upload('a', { kind: 'failed', error: null }))).toBe(true);
    expect(isLostUpload(upload('a', { kind: 'tooLarge' }))).toBe(true);
    expect(isLostUpload(upload('a', { kind: 'sending', progress: 0 }))).toBe(false);
  });

  it('should accept only non-empty video files', () => {
    expect(isVideoFileAccepted(new File(['x'], 'a.MOV'))).toBe(true);
    expect(isVideoFileAccepted(new File([], 'a.mp4'))).toBe(false);
    expect(isVideoFileAccepted(new File(['x'], 'a.png'))).toBe(false);
  });

  it('should recognise the too large error by its code', () => {
    expect(isVideoTooLargeError({ code: 'StoredFile.TooLarge' })).toBe(true);
    expect(isVideoTooLargeError(new Error('StoredFile.TooLarge'))).toBe(false);
  });
});
