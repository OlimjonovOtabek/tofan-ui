import { TestBed } from '@angular/core/testing';
import { LocaleStore } from './locale.store';
import { Translator } from './translator';

describe('Translator', () => {
  let translator: Translator;
  let localeStore: LocaleStore;

  beforeEach(() => {
    localStorage.clear();
    translator = TestBed.inject(Translator);
    localeStore = TestBed.inject(LocaleStore);
  });

  it('should translate a key when the locale is Uzbek', () => {
    expect(translator.translate('common.actions.save')).toBe('Saqlash');
  });

  it('should follow the locale when it changes', () => {
    localeStore.setLocale('ru');
    expect(translator.translate('common.actions.save')).toBe('Сохранить');

    localeStore.setLocale('en');
    expect(translator.translate('common.actions.save')).toBe('Save');
  });

  it('should fill in the parameters when they are given', () => {
    expect(translator.translate('common.confirm.deleteQuestion', { subject: 'Plov' })).toBe(
      '"Plov" o\'chirilsinmi? Buni qaytarib bo\'lmaydi.',
    );
  });

  it('should translate a backend code key when it contains nested segments', () => {
    localeStore.setLocale('en');
    expect(translator.translate('errors.backend.StoredFile.Empty')).toBe(
      'The selected file is empty.',
    );
  });

  it('should pick the backend text in the current language when a message is localized', () => {
    const message = { en: 'Not found.', uz: 'Topilmadi.', ru: 'Не найдено.' };

    expect(translator.message(message)).toBe('Topilmadi.');

    localeStore.setLocale('ru');
    expect(translator.message(message)).toBe('Не найдено.');
  });

  it('should return plain text as is when a message is not a key', () => {
    expect(translator.message('Nom kiritilmagan.')).toBe('Nom kiritilmagan.');
    expect(translator.message('common.toast.error')).toBe('Xatolik');
  });
});
