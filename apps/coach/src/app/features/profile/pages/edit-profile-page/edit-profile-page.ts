import { Component, effect, inject, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { Button } from '@coach/core/ui/button/button';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { TextField } from '@coach/core/ui/text-field/text-field';
import { BIO_MAX, isValidSlug } from '../../models/profile-overview';
import { ProfileEditStore } from '../../profile-edit.store';

@Component({
  selector: 'coach-edit-profile-page',
  imports: [TranslatePipe, MessagePipe, AppBar, Button, EmptyState, TextField],
  providers: [ProfileEditStore],
  template: `
    <coach-app-bar [title]="'coachApp.profile.editTitle' | t" backLink="/profile" />
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
          [title]="'coachApp.profile.name' | t"
          [hint]="'coachApp.profile.nameHint' | t"
          [fieldError]="
            submitted() && name().trim() === '' ? ('coachApp.profile.nameRequired' | t) : null
          "
          [value]="name()"
          (valueChange)="name.set($event)"
        />
        <coach-text-field
          [title]="'coachApp.profile.bio' | t"
          [hint]="'coachApp.profile.bioHint' | t"
          [rows]="4"
          [maxLength]="bioMax"
          [showCounter]="true"
          [clearable]="false"
          [value]="bio()"
          (valueChange)="bio.set($event)"
        />
        <coach-text-field
          [title]="'coachApp.profile.slug' | t"
          [hint]="'coachApp.profile.slugHint' | t"
          [caption]="'coachApp.profile.slugWarning' | t"
          [fieldError]="submitted() && !slugValid() ? ('coachApp.profile.slugInvalid' | t) : null"
          type="url"
          [value]="slug()"
          (valueChange)="slug.set($event)"
        />
      }
      <div class="coach-footer">
        <button coachButton="primary" type="button" [loading]="store.saving()" (click)="save()">
          {{ 'coachApp.common.save' | t }}
        </button>
      </div>
    </div>
  `,
})
export class EditProfilePage {
  protected readonly store = inject(ProfileEditStore);
  private readonly router = inject(Router);

  protected readonly name = signal('');
  protected readonly bio = signal('');
  protected readonly slug = signal('');
  protected readonly submitted = signal(false);
  protected readonly bioMax = BIO_MAX;

  constructor() {
    void this.store.load();
    effect(() => {
      const profile = this.store.profile();
      untracked(() => {
        if (profile !== null) {
          this.name.set(profile.displayName);
          this.bio.set(profile.bio ?? '');
          this.slug.set(profile.slug ?? '');
        }
      });
    });
  }

  protected slugValid(): boolean {
    return isValidSlug(this.slug());
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);
    const profile = this.store.profile();
    if (profile === null || this.name().trim() === '' || !this.slugValid()) {
      return;
    }
    const slug = this.slug().trim();
    const saved = await this.store.save(
      {
        displayName: this.name(),
        bio: this.bio(),
        slug: slug === '' || slug === profile.slug ? null : slug,
      },
      'coachApp.common.saved',
    );
    if (saved) {
      await this.router.navigateByUrl('/profile');
    }
  }
}
