import { Injectable, inject, signal } from '@angular/core';
import { ClientsService } from '@coach/core/clients/clients.service';
import { CoachProfileService } from '@coach/core/profile/coach-profile.service';
import { toCoachProfileChange } from '@coach/core/profile/coach-profile.mapper';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { ProfileOverview, averageOf } from './models/profile-overview';
import { ProfileService } from './services/profile.service';

@Injectable()
export class ProfileStore {
  private readonly profiles = inject(CoachProfileService);
  private readonly clients = inject(ClientsService);
  private readonly stats = inject(ProfileService);
  private readonly uploads = inject(FileUploadService);
  private readonly notifications = inject(NotificationService);

  readonly overview = signal<ProfileOverview | null>(null);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly uploadingPhoto = signal(false);

  async load(): Promise<void> {
    this.loadError.set(null);
    try {
      const [profile, clients, counts] = await Promise.all([
        this.profiles.get(),
        settled(this.clients.list()),
        settled(this.stats.publishedProgramCounts()),
      ]);
      this.overview.set({
        profile,
        clientCount: clients?.length ?? null,
        averageAdherence:
          clients === null ? null : averageOf(clients.map((client) => client.adherencePercent)),
        publishedWorkoutPrograms: counts?.workout ?? null,
        publishedMealPrograms: counts?.meal ?? null,
      });
    } catch (error) {
      this.overview.set(null);
      this.loadError.set(toErrorMessage(error));
    }
  }

  async changePhoto(file: File): Promise<void> {
    const overview = this.overview();
    if (overview === null || this.uploadingPhoto()) {
      return;
    }
    this.uploadingPhoto.set(true);
    try {
      const photoFileId = await this.uploads.upload({ file, category: 'avatar' });
      await this.profiles.update(toCoachProfileChange(overview.profile, { photoFileId }));
      this.notifications.success('coachApp.profile.photoSaved');
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.uploadingPhoto.set(false);
    }
  }
}

async function settled<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}
