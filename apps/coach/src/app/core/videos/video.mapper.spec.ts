import { VideoStreamStatusDto } from './video.dto';
import { canWatch, formatVideoDuration } from './video';
import { toVideoDetails, toVideoIdsQuery } from './video.mapper';

describe('toVideoDetails', () => {
  it('should map the stream status by name', () => {
    expect(
      toVideoDetails({
        fileId: 'f1',
        streamStatus: VideoStreamStatusDto.Pending,
        durationSeconds: 75,
        resumeAtSeconds: 0,
        hlsUrl: null,
        posterUrl: null,
      }),
    ).toEqual({ fileId: 'f1', status: 'pending', durationSeconds: 75 });
  });
});

describe('toVideoIdsQuery', () => {
  it('should repeat the ids parameter for every file', () => {
    expect(toVideoIdsQuery(['a', 'b'])).toBe('ids=a&ids=b');
  });
});

describe('formatVideoDuration', () => {
  it('should show minutes and zero padded seconds', () => {
    expect(formatVideoDuration(75)).toBe('1:15');
    expect(formatVideoDuration(9)).toBe('0:09');
  });
});

describe('canWatch', () => {
  it('should allow watching only when some source exists', () => {
    expect(canWatch({ videoUrl: null, hlsUrl: null, posterUrl: null })).toBe(false);
    expect(canWatch({ videoUrl: null, hlsUrl: '/streams/x', posterUrl: null })).toBe(true);
    expect(canWatch({ videoUrl: null, hlsUrl: null, posterUrl: null, localUrl: 'blob:1' })).toBe(
      true,
    );
  });
});
