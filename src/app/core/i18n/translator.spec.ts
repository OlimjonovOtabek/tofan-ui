import { TestBed } from '@angular/core/testing';
import { Translator } from './translator';
import { LocaleStore } from './locale.store';
import { signal } from '@angular/core';
import { AppLocale } from './locale';

describe('Translator', () => {
  let translator: Translator;
  let mockLocale: ReturnType<typeof signal<AppLocale>>;

  beforeEach(() => {
    mockLocale = signal<AppLocale>('uz');
    
    TestBed.configureTestingModule({
      providers: [
        Translator,
        {
          provide: LocaleStore,
          useValue: { locale: mockLocale }
        }
      ]
    });
    
    translator = TestBed.inject(Translator);
  });

  it('should translate existing key in current locale', () => {
    expect(translator.translate('common.save')).toBe('Saqlash');
  });

  it('should translate in another locale', () => {
    mockLocale.set('ru');
    expect(translator.translate('common.save')).toBe('Сохранить');
  });

  it('should format parameters correctly', () => {
    expect(translator.translate('common.greeting', { name: 'John' })).toBe('Salom John');
  });
  


  it('should return key if key is missing everywhere', () => {
    expect(translator.translate('common.missingKey')).toBe('common.missingKey');
  });
});
