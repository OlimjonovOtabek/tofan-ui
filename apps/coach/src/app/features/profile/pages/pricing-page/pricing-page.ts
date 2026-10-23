import { Component, effect, inject, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { Button } from '@coach/core/ui/button/button';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Note } from '@coach/core/ui/note/note';
import { TextField } from '@coach/core/ui/text-field/text-field';
import { ProfileEditStore } from '../../profile-edit.store';

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
  protected readonly submitted = signal(false);

  constructor() {
    void this.store.load();
    effect(() => {
      const profile = this.store.profile();
      untracked(() =>
        this.price.set(
          profile?.monthlyPrice == null ? '' : String(Math.round(profile.monthlyPrice)),
        ),
      );
    });
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);
    if (this.price() === '') {
      return;
    }
    if (await this.store.save({ monthlyPrice: Number(this.price()) }, 'coachApp.pricing.saved')) {
      await this.router.navigateByUrl('/profile');
    }
  }
}
