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
  
  it('should fallback to uz if key is missing in another locale at runtime', () => {
    mockLocale.set('en');
    const originalEn = (translator as any).DICTIONARIES?.en?.common;
    if ((translator as any).DICTIONARIES) {
      // simulate missing key at runtime
      (translator as any).DICTIONARIES.en = { common: {} };
    }
    // since we can't easily mutate the imported dictionary, we can mock getValue
    const originalGetValue = (translator as any).getValue.bind(translator);
    (translator as any).getValue = (dict: any, key: string) => {
      // act as if 'ru'/'en' doesn't have it, but 'uz' does
      if (dict === (translator as any).store) return undefined; // store check is weird, just check dictionary identity
      // Actually simpler:
      if (dict === (translator as any).DICTIONARIES?.['uz'] || dict?.common?.save === 'Saqlash') {
        return 'Saqlash';
      }
      return undefined;
    };
    
    expect(translator.translate('common.save')).toBe('Saqlash');
    (translator as any).getValue = originalGetValue;
  });

  it('should return key if key is missing everywhere', () => {
    expect(translator.translate('common.missingKey')).toBe('common.missingKey');
  });
});
