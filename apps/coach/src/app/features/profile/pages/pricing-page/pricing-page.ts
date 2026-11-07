import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { Button } from '@coach/core/ui/button/button';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Note } from '@coach/core/ui/note/note';
import { TextField } from '@coach/core/ui/text-field/text-field';
import { ProfileEditStore } from '../../profile-edit.store';
import { isVipPriceInputValid, priceInputOf, vipPriceOfInput } from '../../models/profile-price';

const DIGITS = /[0-9]/;

@Component({
  selector: 'coach-pricing-page',
  imports: [TranslatePipe, MessagePipe, AppBar, Button, EmptyState, Note, TextField],
  providers: [ProfileEditStore],
  template: `
    <coach-app-bar [title]="'coachApp.pricing.title' | t" backLink="/profile" />
    <div class="coach-page coach-page--pushed coach-page--with-footer">
      @if (store.loadError(); as error) {
        <coach-empty-state
          icon="alert-triangle"
          [title]="'coachApp.profile.errorTitle' | t"
          [message]="error | message"
          [retryable]="true"
          (retry)="store.load()"
        />
      } @else if (store.profile()) {
        <coach-text-field
          [title]="'coachApp.profile.priceLabel' | t"
          [hint]="'coachApp.profile.priceHint' | t"
          [suffix]="'coachApp.profile.priceUnit' | t"
          inputMode="numeric"
          [allowed]="digits"
          [autofocus]="true"
          [fieldError]="
            submitted() && price() === '' ? ('coachApp.profile.priceRequired' | t) : null
          "
          [value]="price()"
          (valueChange)="price.set($event)"
          (submitted)="save()"
        />
        <coach-note [text]="'coachApp.pricing.note' | t" />
        <coach-text-field
          [title]="'coachApp.pricing.vipLabel' | t"
          [hint]="'coachApp.pricing.vipHint' | t"
          [suffix]="'coachApp.profile.priceUnit' | t"
          inputMode="numeric"
          [allowed]="digits"
          [fieldError]="vipInvalid() ? ('coachApp.pricing.vipInvalid' | t) : null"
          [value]="vipPrice()"
          (valueChange)="vipPrice.set($event)"
          (submitted)="save()"
        />
        <coach-note icon="message-circle" [text]="'coachApp.pricing.vipNote' | t" />
      }
      <div class="coach-footer">
        <button coachButton="primary" type="button" [loading]="store.saving()" (click)="save()">
          {{ 'coachApp.common.save' | t }}
        </button>
      </div>
    </div>
  `,
})
export class PricingPage {
  protected readonly store = inject(ProfileEditStore);
  private readonly router = inject(Router);

  protected readonly digits = DIGITS;
  protected readonly price = signal('');
  protected readonly vipPrice = signal('');
  protected readonly submitted = signal(false);
  protected readonly vipInvalid = computed(
    () => this.submitted() && !isVipPriceInputValid(this.vipPrice()),
  );

  constructor() {
    void this.store.load();
    effect(() => {
      const profile = this.store.profile();
      untracked(() => {
        this.price.set(priceInputOf(profile?.monthlyPrice ?? null));
        this.vipPrice.set(priceInputOf(profile?.vipMonthlyPrice ?? null));
      });
    });
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);
    if (this.price() === '' || !isVipPriceInputValid(this.vipPrice())) {
      return;
    }
    const saved = await this.store.save(
      { monthlyPrice: Number(this.price()), vipMonthlyPrice: vipPriceOfInput(this.vipPrice()) },
      'coachApp.pricing.saved',
    );
    if (saved) {
      await this.router.navigateByUrl('/profile');
    }
  }
}
