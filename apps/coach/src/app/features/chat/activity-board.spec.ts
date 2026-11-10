import { ActivityBoard } from './activity-board';

describe('ActivityBoard', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('should show an activity for five seconds after the last notice', () => {
    const board = new ActivityBoard();

    board.show('c1', 'typing');
    vi.advanceTimersByTime(4000);
    board.show('c1', 'recordingVoice');
    vi.advanceTimersByTime(4000);

    expect(board.activities().get('c1')).toBe('recordingVoice');
    vi.advanceTimersByTime(1001);
    expect(board.activities().has('c1')).toBe(false);
  });

  it('should clear one key without touching the others', () => {
    const board = new ActivityBoard();
    board.show('c1', 'typing');
    board.show('c2', 'uploading');

    board.clear('c1');

    expect([...board.activities().keys()]).toEqual(['c2']);
    board.dispose();
  });
});
