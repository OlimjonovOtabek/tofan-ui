import { localizedNameField, pickLocalized } from './localized-text';

describe('pickLocalized', () => {
  const text = { en: 'Apple', uz: 'Olma', ru: 'Яблоко' };

  it('should return the text of the locale when it is filled in', () => {
    expect(pickLocalized(text, 'uz')).toBe('Olma');
    expect(pickLocalized(text, 'ru')).toBe('Яблоко');
    expect(pickLocalized(text, 'en')).toBe('Apple');
  });

  it('should fall back to Uzbek when the locale text is blank', () => {
    expect(pickLocalized({ ...text, ru: '  ' }, 'ru')).toBe('Olma');
  });

  it('should fall back to English when Uzbek is blank too', () => {
    expect(pickLocalized({ en: 'Apple', uz: '', ru: '' }, 'ru')).toBe('Apple');
  });

  it('should fall back to Russian when only Russian is filled in', () => {
    expect(pickLocalized({ en: '', uz: '', ru: 'Яблоко' }, 'en')).toBe('Яблоко');
  });

  it('should return an empty string when every language is blank', () => {
    expect(pickLocalized({ en: '', uz: '', ru: '' }, 'uz')).toBe('');
  });
});

describe('localizedNameField', () => {
  it('should sort by the column of the locale', () => {
    expect(localizedNameField('en')).toBe('name');
    expect(localizedNameField('uz')).toBe('nameUz');
    expect(localizedNameField('ru')).toBe('nameRu');
  });
});
