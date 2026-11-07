import { Component, computed, input, output } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Tier } from '@shared/models/tier';
import { TIER_LABELS } from '@shared/models/tier-labels';

@Component({
  selector: 'app-tier-card',
  imports: [Button, TranslatePipe],
  templateUrl: './tier-card.html',
})
export class TierCard {
  readonly tier = input.required<Tier>();
  readonly benefits = input.required<readonly string[]>();

  readonly edit = output<void>();

  protected readonly label = computed(() => TIER_LABELS[this.tier()]);
}
