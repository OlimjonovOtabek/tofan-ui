import { FILE_CATEGORY_LABELS, FILE_CATEGORY_OPTIONS } from './file-labels';

describe('file category labels', () => {
  it('should label the chat categories when the media list shows chat files', () => {
    expect(FILE_CATEGORY_LABELS.chatVoice).toBe('media.categories.chatVoice');
  });

  it('should not offer the chat categories when an admin uploads a file', () => {
    const values = FILE_CATEGORY_OPTIONS.map((option) => option.value);

    expect(values).toContain('garmentImage');
    expect(values).not.toContain('chatImage');
    expect(values).not.toContain('chatFile');
  });
});
