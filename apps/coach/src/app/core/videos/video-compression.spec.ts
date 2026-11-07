import { copyFileName, copyFrameRate, copySize, isWorthCompressing } from './video-compression';

const MEGABYTE = 1024 * 1024;

describe('video compression rules', () => {
  const small = { width: 1280, height: 720, bytes: 50 * MEGABYTE, highDynamicRange: false };

  it('should leave a light video at most 1080p untouched', () => {
    expect(isWorthCompressing(small)).toBe(false);
  });

  it('should compress when the longer side is over 1080p', () => {
    expect(isWorthCompressing({ ...small, width: 2160, height: 3840 })).toBe(true);
  });

  it('should compress when the file is over 200 MB', () => {
    expect(isWorthCompressing({ ...small, bytes: 201 * MEGABYTE })).toBe(true);
  });

  it('should leave an HDR video untouched when the browser cannot tone map it', () => {
    expect(isWorthCompressing({ ...small, width: 3840, highDynamicRange: true })).toBe(false);
  });

  it('should scale the longer side to 1920 and keep even sides', () => {
    expect(copySize({ width: 2160, height: 3840 })).toEqual({ width: 1080, height: 1920 });
    expect(copySize({ width: 3001, height: 1999 })).toEqual({ width: 1920, height: 1278 });
  });

  it('should not upscale a smaller video', () => {
    expect(copySize({ width: 1280, height: 720 })).toEqual({ width: 1280, height: 720 });
  });

  it('should cap the frame rate at 30', () => {
    expect(copyFrameRate(60)).toBe(30);
    expect(copyFrameRate(24)).toBe(24);
  });

  it('should name the copy as an mp4', () => {
    expect(copyFileName('squat.mov')).toBe('squat.mp4');
    expect(copyFileName('squat')).toBe('squat.mp4');
  });
});
