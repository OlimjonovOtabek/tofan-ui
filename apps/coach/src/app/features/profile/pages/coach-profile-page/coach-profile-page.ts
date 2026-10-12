import { Skeleton } from '@openng/optimus-ui/skeleton';
import { Message } from '@openng/optimus-ui/message';
import { Avatar } from '@openng/optimus-ui/avatar';
import { Card } from '@openng/optimus-ui/card';
import { Button } from '@openng/optimus-ui/button';
import { NumberField } from '@shared/components/number-field/number-field';
import { ProgressBar } from '@openng/optimus-ui/progressbar';
import { TextareaField } from '@shared/components/textarea-field/textarea-field';
import { TextField } from '@shared/components/text-field/text-field';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Component, DestroyRef, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormField, form, min, pattern, required, schema } from '@angular/forms/signals';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { MessagePipe } from '@core/i18n/message.pipe';
import { CoachProfileStore } from '../../coach-profile.store';
import { UpdateCoachProfileRequest } from '@coach/core/profile/coach-profile.dto';

interface ProfileFormValue {
  displayName: string;
  bio: string;
  photoFileId: string | null;
  monthlyPrice: number | null;
}

const PRICE_MIN = 1;
const NON_BLANK = /\S/;

const profileSchema = schema<ProfileFormValue>((path) => {
  required(path.displayName, { message: 'coach.profile.errors.displayName' });
  pattern(path.displayName, NON_BLANK, { message: 'coach.profile.errors.displayName' });
  required(path.monthlyPrice, { message: 'coach.profile.errors.price' });
  min(path.monthlyPrice, PRICE_MIN, { message: 'coach.profile.errors.price' });
});

function emptyForm(): ProfileFormValue {
  return { displayName: '', bio: '', photoFileId: null, monthlyPrice: null };
}

@Component({
  selector: 'coach-profile-page',
  imports: [
    Skeleton,
    Message,
    Avatar,
    Card,
    Button,
    NumberField,
    ProgressBar,
    TextareaField,
    TextField,
    ButtonDirective,
    FormField,
    TranslatePipe,
    MessagePipe,
  ],
  providers: [CoachProfileStore],
  templateUrl: './coach-profile-page.html',
  styleUrl: './coach-profile-page.css',
})
export class CoachProfilePage implements OnInit {
  protected readonly store = inject(CoachProfileStore);
  private readonly confirmations = inject(ConfirmDialogService);
  protected readonly value = signal<ProfileFormValue>(emptyForm());
  protected readonly profileForm = form(this.value, profileSchema);
  protected readonly photoFailure = signal(false);
  protected readonly photoPreview = signal<string | null>(null);
  protected readonly photoSource = computed(() => {
    const preview = this.photoPreview();
    if (preview !== null) {
      return preview;
    }
    return this.photoFailure() ? undefined : (this.store.profile()?.photoUrl ?? undefined);
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.showPhotoPreview(null));
    effect(() => {
      const profile = this.store.profile();
      if (profile !== null) {
        untracked(() =>
          this.value.set({
            displayName: profile.displayName,
            bio: profile.bio ?? '',
            photoFileId: profile.photoFileId,
            monthlyPrice: profile.monthlyPrice,
          }),
        );
      }
    });
  }

  ngOnInit(): void {
    void this.store.load();
  }

  protected async save(): Promise<void> {
    this.profileForm().markAsTouched();
    const value = this.value();
    if (this.profileForm().invalid() || value.monthlyPrice === null) {
      return;
    }
    await this.store.save(toRequest(value));
  }

  protected async selectPhoto(event: Event): Promise<void> {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const file = input.files?.[0];
    if (file === undefined) {
      return;
    }
    input.value = '';
    const previousPreview = this.photoPreview();
    this.photoPreview.set(URL.createObjectURL(file));
    const fileId = await this.store.uploadPhoto(file);
    if (fileId === null) {
      this.showPhotoPreview(previousPreview);
      return;
    }
    this.releasePhotoPreview(previousPreview);
    this.value.update((value) => ({ ...value, photoFileId: fileId }));
    this.photoFailure.set(false);
  }

  private showPhotoPreview(preview: string | null): void {
    const current = this.photoPreview();
    if (current !== preview) {
      this.releasePhotoPreview(current);
    }
    this.photoPreview.set(preview);
  }

  private releasePhotoPreview(preview: string | null): void {
    if (preview !== null) {
      URL.revokeObjectURL(preview);
    }
  }

  protected cancelPhotoUpload(): void {
    this.store.cancelPhotoUpload();
  }

  async canLeave(): Promise<boolean> {
    if (this.store.uploadProgress() === null) {
      return true;
    }
    const confirmed = await this.confirmations.confirm({ key: 'coach.workspace.uploadLeave' });
    if (confirmed) {
      this.store.cancelPhotoUpload();
    }
    return confirmed;
  }
}

function toRequest(value: ProfileFormValue): UpdateCoachProfileRequest {
  return {
    displayName: value.displayName,
    bio: value.bio,
    photoFileId: value.photoFileId,
    monthlyPrice: value.monthlyPrice ?? PRICE_MIN,
  };
}

export const canDeactivateCoachProfile: CanDeactivateFn<CoachProfilePage> = (component) =>
  component.canLeave();
