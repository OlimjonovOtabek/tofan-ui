import { lookupText } from '@core/i18n/translation-lookup';
import { DICTIONARY_EN } from '@core/i18n/translations/en';
import { DICTIONARY_RU } from '@core/i18n/translations/ru';
import { DICTIONARY_UZ } from '@core/i18n/translations/uz';
import { MEAL_TYPES } from './meal-type';
import { MEAL_TYPE_LABELS, MEAL_TYPE_OPTIONS } from './meal-type-labels';

const DICTIONARIES = [DICTIONARY_UZ, DICTIONARY_RU, DICTIONARY_EN];

describe('meal type labels', () => {
  it('should have a non-blank text in every language when a meal type has a label key', () => {
    for (const dictionary of DICTIONARIES) {
      for (const type of MEAL_TYPES) {
        expect(lookupText(dictionary, MEAL_TYPE_LABELS[type])?.trim()).toBeTruthy();
      }
    }
  });

  it('should list the options in the fixed meal order when building the select options', () => {
    expect(MEAL_TYPE_OPTIONS.map((option) => option.value)).toEqual([...MEAL_TYPES]);
  });
});
