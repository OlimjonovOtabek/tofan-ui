import {
  isLongEnough,
  levelFromRms,
  pickRecordingFormat,
  pushLevel,
  recordedSeconds,
} from './voice-note';

describe('voice note rules', () => {
  it('should prefer webm with opus and fall back to mp4 for Safari', () => {
    expect(pickRecordingFormat(() => true)?.fileName).toBe('voice.webm');
    expect(pickRecordingFormat((type) => type === 'audio/mp4')).toEqual({
      mimeType: 'audio/mp4',
      fileName: 'voice.m4a',
    });
    expect(pickRecordingFormat(() => false)).toBeNull();
  });

  it('should accept a recording from one second', () => {
    expect(isLongEnough(999)).toBe(false);
    expect(isLongEnough(1000)).toBe(true);
    expect(recordedSeconds(400)).toBe(1);
    expect(recordedSeconds(2600)).toBe(3);
  });

  it('should keep the latest forty eight levels within range', () => {
    const levels = Array.from({ length: 48 }, () => 10);

    const next = pushLevel(levels, 140);

    expect(next).toHaveLength(48);
    expect(next.at(-1)).toBe(100);
    expect(pushLevel([], -3)).toEqual([0]);
  });

  it('should show quiet sound clearly by measuring the level in decibels', () => {
    expect(levelFromRms(0)).toBe(0);
    expect(levelFromRms(0.001)).toBe(0);
    expect(levelFromRms(0.01)).toBeCloseTo(33.3, 0);
    expect(levelFromRms(0.1)).toBeCloseTo(66.7, 0);
    expect(levelFromRms(1)).toBe(100);
  });
});
