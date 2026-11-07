import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { Message } from '@openng/optimus-ui/message';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { BenefitsDialog } from '@shared/components/benefits-dialog/benefits-dialog';
import { Benefit } from '@shared/models/benefit';
import { pickLocalized } from '@shared/models/localized-text';
import { Tier } from '@shared/models/tier';
import { TIER_LABELS } from '@shared/models/tier-labels';
import { TierCard } from '../../components/tier-card/tier-card';
import { TrainerTiersStore } from '../../trainer-tiers.store';

@Component({
  selector: 'app-trainer-tiers-page',
  imports: [Button, Message, BenefitsDialog, TierCard, MessagePipe, TranslatePipe],
  providers: [TrainerTiersStore],
  templateUrl: './trainer-tiers-page.html',
})
export class TrainerTiersPage implements OnInit {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(TrainerTiersStore);

  protected readonly editing = signal<Tier | null>(null);
  protected readonly dialogVisible = signal(false);

  protected readonly cards = computed(() =>
    this.store.tiers().map((entry) => ({
      tier: entry.tier,
      benefits: entry.benefits.map((benefit) => pickLocalized(benefit, this.localeStore.locale())),
    })),
  );
  protected readonly editingBenefits = computed<readonly Benefit[]>(
    () => this.store.tiers().find((entry) => entry.tier === this.editing())?.benefits ?? [],
  );
  protected readonly dialogHeader = computed(() => {
    const tier = this.editing();
    return this.translator.translate('trainers.tiers.dialogHeader', {
      tier: tier === null ? '' : this.translator.translate(TIER_LABELS[tier]),
    });
  });

  ngOnInit(): void {
    void this.store.load();
  }

  protected edit(tier: Tier): void {
    this.editing.set(tier);
    this.dialogVisible.set(true);
  }

  protected async save(benefits: readonly Benefit[]): Promise<void> {
    const tier = this.editing();
    if (tier !== null && (await this.store.changeBenefits(tier, benefits))) {
      this.dialogVisible.set(false);
    }
  }
}
