import { isLongEnough, pickRecordingFormat, recordedSeconds, remainingShare } from './recording';
import { VIDEO_NOTE_FORMATS } from './video-note-capture';

describe('recording rules', () => {
  it('should accept a recording from one second and round its length', () => {
    expect(isLongEnough(999)).toBe(false);
    expect(isLongEnough(1000)).toBe(true);
    expect(recordedSeconds(400)).toBe(1);
    expect(recordedSeconds(2600)).toBe(3);
  });

  it('should pick webm for a video note and mp4 for Safari', () => {
    expect(pickRecordingFormat(VIDEO_NOTE_FORMATS, () => true)?.fileName).toBe('video-note.webm');
    expect(pickRecordingFormat(VIDEO_NOTE_FORMATS, (type) => type === 'video/mp4')?.fileName).toBe(
      'video-note.mp4',
    );
    expect(pickRecordingFormat(VIDEO_NOTE_FORMATS, () => false)).toBeNull();
  });

  it('should tell how much of the time limit is left', () => {
    expect(remainingShare(0, 60_000)).toBe(1);
    expect(remainingShare(15_000, 60_000)).toBe(0.75);
    expect(remainingShare(90_000, 60_000)).toBe(0);
  });
});
