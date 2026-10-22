import { translateLanding } from './landing-translate';

describe('translateLanding', () => {
  it('should return the text of the requested locale when the key exists', () => {
    expect(translateLanding('uz', 'nav.faq')).toBe('Savollar');
    expect(translateLanding('ru', 'nav.faq')).toBe('Вопросы');
    expect(translateLanding('en', 'nav.faq')).toBe('FAQ');
  });

  it('should fill the placeholders when params are given', () => {
    expect(translateLanding('en', 'footer.copyright', { year: 2030 })).toBe(
      '© 2030 Peaktofan. All rights reserved.',
    );
  });
});
