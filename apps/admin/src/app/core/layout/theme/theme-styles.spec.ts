import { THEME_STYLES, ThemeStyle, findActiveStyle, stylePreview } from './theme-styles';

function styleById(id: string): ThemeStyle {
  const style = THEME_STYLES.find((candidate) => candidate.id === id);
  if (!style) {
    throw new Error(`missing style ${id}`);
  }
  return style;
}

describe('THEME_STYLES', () => {
  it('should offer ten styles when listing ready styles', () => {
    expect(THEME_STYLES).toHaveLength(10);
  });

  it('should keep every style different when two styles are compared', () => {
    const keys = THEME_STYLES.map((style) => JSON.stringify(style.config));
    expect(new Set(keys).size).toBe(THEME_STYLES.length);
  });

  it('should keep every id unique when styles are tracked by id', () => {
    expect(new Set(THEME_STYLES.map((style) => style.id)).size).toBe(THEME_STYLES.length);
  });
});

describe('findActiveStyle', () => {
  it('should find the style when the config matches it exactly', () => {
    expect(findActiveStyle(styleById('midnight').config)?.id).toBe('midnight');
  });

  it('should find nothing when one field differs from every style', () => {
    expect(findActiveStyle({ ...styleById('ocean').config, card: 'red' })).toBeUndefined();
  });
});

describe('stylePreview', () => {
  it('should show the default gradient and a white sheet when the style is classic', () => {
    expect(stylePreview(styleById('classic'))).toEqual({
      ground: 'linear-gradient(180deg, #e8ebf3 0%, #eeebe6 100%)',
      sheet: '#ffffff',
      accent: '#3b82f6',
    });
  });

  it('should tint the sheet when the style has a card color', () => {
    expect(stylePreview(styleById('sunset')).sheet).toBe(
      'color-mix(in srgb, #f5e9e0, #ffffff 55%)',
    );
  });

  it('should use the dark surface and a light accent when the style is dark', () => {
    const preview = stylePreview(styleById('midnight'));
    expect(preview.ground).toBe('#000123');
    expect(preview.sheet).toBe('#0f172a');
    expect(preview.accent).toBe('#818cf8');
  });

  it('should use a near white accent when the dark style is monochrome', () => {
    expect(stylePreview(styleById('carbon')).accent).toBe('#fafafa');
  });
});
