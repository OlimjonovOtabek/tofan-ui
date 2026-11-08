import { Component, computed, inject, input } from '@angular/core';
import { TranslationKey, TranslationParams } from '@core/i18n/dictionary';
import { INTL_LOCALES } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { PlatformFeeDraft } from '../../models/platform-fee-draft';
import { PLATFORM_FEE_FRACTION_DIGITS } from '../../models/platform-fee-rules';
import {
  SAMPLE_TRAINER_PRICE,
  TrainerPriceBreakdown,
  trainerPriceBreakdown,
} from '../../models/trainer-price-breakdown';

interface SampleRow {
  readonly label: TranslationKey;
  readonly params: TranslationParams;
  readonly amount: string;
}

@Component({
  selector: 'app-platform-fee-sample',
  imports: [TranslatePipe],
  templateUrl: './platform-fee-sample.html',
})
export class PlatformFeeSample {
  private readonly localeStore = inject(LocaleStore);

  readonly fee = input.required<PlatformFeeDraft>();
  readonly currencyCode = input.required<string>();

  private readonly numbers = computed(
    () =>
      new Intl.NumberFormat(INTL_LOCALES[this.localeStore.locale()], {
        maximumFractionDigits: PLATFORM_FEE_FRACTION_DIGITS,
      }),
  );
  private readonly breakdown = computed<TrainerPriceBreakdown>(() =>
    trainerPriceBreakdown(SAMPLE_TRAINER_PRICE, this.fee()),
  );

  protected readonly rows = computed<readonly SampleRow[]>(() => {
    const { price, commission, tax, providerFee } = this.breakdown();
    return [
      { label: 'platformFee.sample.price', params: {}, amount: this.money(price) },
      { label: 'platformFee.sample.commission', params: {}, amount: this.money(commission) },
      {
        label: 'platformFee.sample.tax',
        params: this.percent(this.fee().taxPercent),
        amount: this.money(tax),
      },
      {
        label: 'platformFee.sample.providerFee',
        params: this.percent(this.fee().providerFeePercent),
        amount: this.money(providerFee),
      },
    ];
  });
  protected readonly total = computed(() => this.money(this.breakdown().total));

  private money(amount: number): string {
    return `${this.numbers().format(amount)} ${this.currencyCode()}`;
  }

  private percent(value: number): TranslationParams {
    return { percent: this.numbers().format(value) };
  }
}
