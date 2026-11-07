import { Component, inject, signal } from '@angular/core';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Button } from '@openng/optimus-ui/button';
import { Message } from '@openng/optimus-ui/message';
import { CatalogHeader } from '@shared/components/catalog-header/catalog-header';
import { TariffCard } from '../../components/tariff-card/tariff-card';
import { TariffFormDialog } from '../../components/tariff-form-dialog/tariff-form-dialog';
import { Tariff } from '../../models/tariff';
import { TariffDraft } from '../../models/tariff-draft';
import { TariffsStore } from '../../tariffs.store';

@Component({
  selector: 'app-tariffs-page',
  imports: [
    Button,
    Message,
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
  protected readonly store = inject(TariffsStore);

  protected readonly editing = signal<Tariff | null>(null);
  protected readonly formVisible = signal(false);

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
}
