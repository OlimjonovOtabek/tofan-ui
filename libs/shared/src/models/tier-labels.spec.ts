import { lookupText } from '@core/i18n/translation-lookup';
import { DICTIONARY_EN } from '@core/i18n/translations/en';
import { DICTIONARY_RU } from '@core/i18n/translations/ru';
import { DICTIONARY_UZ } from '@core/i18n/translations/uz';
import { TIERS } from './tier';
import { TIER_LABELS } from './tier-labels';

const DICTIONARIES = [DICTIONARY_UZ, DICTIONARY_RU, DICTIONARY_EN];

describe('tier labels', () => {
  it('should have a non-blank text in every language when a tier has a label key', () => {
    for (const dictionary of DICTIONARIES) {
      for (const tier of TIERS) {
        expect(lookupText(dictionary, TIER_LABELS[tier])?.trim()).toBeTruthy();
      }
    }
  });

  it('should keep the VIP name in every language when reading the VIP label', () => {
    for (const dictionary of DICTIONARIES) {
      expect(lookupText(dictionary, TIER_LABELS.vip)).toBe('VIP');
    }
  });
});
