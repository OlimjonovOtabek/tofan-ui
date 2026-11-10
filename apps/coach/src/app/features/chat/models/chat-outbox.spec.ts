import { captionFor, combinedProgress } from './chat-outbox';

describe('outbox rules', () => {
  it('should weigh the progress of each file by its size', () => {
    expect(combinedProgress([100, 300], [100, 0])).toBe(25);
    expect(combinedProgress([100, 300], [100, 100])).toBe(100);
    expect(combinedProgress([], [])).toBe(0);
  });

  it('should drop the caption of a voice message and trim the others', () => {
    expect(captionFor('voice', 'hello')).toBe('');
    expect(captionFor('image', '  Leg day ')).toBe('Leg day');
  });
});
