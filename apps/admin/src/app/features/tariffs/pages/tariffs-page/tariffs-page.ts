import { Component, computed, inject, signal } from '@angular/core';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@openng/optimus-ui/button';
import { Message } from '@openng/optimus-ui/message';
import { BenefitsDialog } from '@shared/components/benefits-dialog/benefits-dialog';
import { CatalogHeader } from '@shared/components/catalog-header/catalog-header';
import { Benefit } from '@shared/models/benefit';
import { TariffCard } from '../../components/tariff-card/tariff-card';
import { TariffFormDialog } from '../../components/tariff-form-dialog/tariff-form-dialog';
import { Tariff } from '../../models/tariff';
import { TariffDraft } from '../../models/tariff-draft';
import { TARIFF_TYPE_LABELS } from '../../models/tariff-labels';
import { TariffType } from '../../models/tariff-type';
import { TariffsStore } from '../../tariffs.store';

@Component({
  selector: 'app-tariffs-page',
  imports: [
    Button,
    Message,
    BenefitsDialog,
    CatalogHeader,
    TariffCard,
    TariffFormDialog,
    MessagePipe,
    TranslatePipe,
  ],
  providers: [TariffsStore],
  templateUrl: './tariffs-page.html',
})
export class TariffsPage {
  private readonly translator = inject(Translator);

  protected readonly store = inject(TariffsStore);

  protected readonly editing = signal<Tariff | null>(null);
  protected readonly formVisible = signal(false);
  protected readonly editingBenefitsOf = signal<TariffType | null>(null);
  protected readonly benefitsVisible = signal(false);

  protected readonly editingBenefits = computed<readonly Benefit[]>(
    () =>
      this.store.tariffs().find((tariff) => tariff.type === this.editingBenefitsOf())?.benefits ??
      [],
  );
  protected readonly benefitsHeader = computed(() => {
    const type = this.editingBenefitsOf();
    return this.translator.translate('tariffs.benefits.dialogHeader', {
      tariff: type === null ? '' : this.translator.translate(TARIFF_TYPE_LABELS[type]),
    });
  });

  constructor() {
    void this.store.load();
  }

  protected edit(tariff: Tariff): void {
    this.editing.set(tariff);
    this.formVisible.set(true);
  }

  protected async save(draft: TariffDraft): Promise<void> {
    const tariff = this.editing();
    if (tariff !== null && (await this.store.change(tariff.type, draft))) {
      this.formVisible.set(false);
    }
  }

  protected editBenefits(tariff: Tariff): void {
    this.editingBenefitsOf.set(tariff.type);
    this.benefitsVisible.set(true);
  }

  protected async saveBenefits(benefits: readonly Benefit[]): Promise<void> {
    const type = this.editingBenefitsOf();
    if (type !== null && (await this.store.changeBenefits(type, benefits))) {
      this.benefitsVisible.set(false);
    }
  }
}
