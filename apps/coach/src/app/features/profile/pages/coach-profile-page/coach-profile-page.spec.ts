import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { NotificationService } from '@core/feedback/notification.service';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import {
  FileUploadTask,
  UploadCancelledError,
} from '@shared/components/file-upload/file-upload-request';
import { CoachProfile } from '@coach/core/profile/coach-profile.dto';
import { CoachProfilePage } from './coach-profile-page';
import { CoachProfileService } from '@coach/core/profile/coach-profile.service';

const profile: CoachProfile = {
  id: 'coach-1',
  userId: 'user-1',
  displayName: 'Test coach',
  bio: 'Training plans',
  photoFileId: null,
  photoUrl: null,
  monthlyPrice: 150000,
  isPublished: false,
};

const PREVIEW_URL = 'blob:photo-preview';

async function choosePhoto(fixture: ComponentFixture<CoachProfilePage>): Promise<void> {
  const host = fixture.nativeElement as HTMLElement;
  const chooser = host.querySelector<HTMLInputElement>('#coachPhoto');
  if (chooser === null) {
    throw new Error('Photo chooser was not rendered');
  }
  Object.defineProperty(chooser, 'files', {
    value: [new File(['photo'], 'photo.png', { type: 'image/png' })],
  });
  chooser.dispatchEvent(new Event('change'));
  await fixture.whenStable();
  fixture.detectChanges();
}

function avatarImage(fixture: ComponentFixture<CoachProfilePage>): string | null {
  const host = fixture.nativeElement as HTMLElement;
  return host.querySelector<HTMLImageElement>('p-avatar img')?.getAttribute('src') ?? null;
}

async function renderProfile() {
  const fixture = TestBed.createComponent(CoachProfilePage);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('CoachProfilePage', () => {
  let service: Pick<CoachProfileService, 'get' | 'update'>;
  let uploadTask: FileUploadTask;

  beforeEach(() => {
    service = {
      get: vi.fn().mockResolvedValue(profile),
      update: vi.fn().mockResolvedValue(undefined),
    };
    const uploads: Pick<FileUploadService, 'startUpload'> = {
      startUpload: vi.fn(() => uploadTask),
    };
    uploadTask = { result: Promise.resolve('photo-1'), cancel: vi.fn() };
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(PREVIEW_URL);
    vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined);
    const notifications: Pick<NotificationService, 'success' | 'error'> = {
      success: vi.fn(),
      error: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: CoachProfileService, useValue: service },
        { provide: FileUploadService, useValue: uploads },
        { provide: NotificationService, useValue: notifications },
        { provide: ConfirmDialogService, useValue: { confirm: vi.fn().mockResolvedValue(true) } },
      ],
    });
  });

  it('should render the loaded profile and its editable fields', async () => {
    const fixture = await renderProfile();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector<HTMLInputElement>('#coachDisplayName')?.value).toBe(
      profile.displayName,
    );
    expect(host.querySelector<HTMLTextAreaElement>('#coachBio')?.value).toBe(profile.bio);
    expect(host.querySelector<HTMLButtonElement>('button[type="submit"]')).not.toBeNull();
  });

  it('should submit the edited biography with the profile fields', async () => {
    const fixture = await renderProfile();
    const host = fixture.nativeElement as HTMLElement;
    const biography = host.querySelector<HTMLTextAreaElement>('#coachBio');
    if (biography === null) {
      throw new Error('Biography control was not rendered');
    }
    biography.value = 'Updated training plans';
    biography.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    host
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(service.update).toHaveBeenCalledWith({
      displayName: profile.displayName,
      bio: 'Updated training plans',
      photoFileId: null,
      monthlyPrice: profile.monthlyPrice,
    });
  });

  it('should show the chosen photo and send its file when the upload succeeds', async () => {
    const fixture = await renderProfile();
    await choosePhoto(fixture);
    expect(avatarImage(fixture)).toBe(PREVIEW_URL);
    const host = fixture.nativeElement as HTMLElement;
    host
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(service.update).toHaveBeenCalledWith(expect.objectContaining({ photoFileId: 'photo-1' }));
  });

  it('should drop the chosen photo without an error when the upload is cancelled', async () => {
    uploadTask = { result: Promise.reject(new UploadCancelledError()), cancel: vi.fn() };
    const fixture = await renderProfile();
    await choosePhoto(fixture);
    const host = fixture.nativeElement as HTMLElement;
    expect(avatarImage(fixture)).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(PREVIEW_URL);
    expect(host.querySelector('.photo-field p-message')).toBeNull();
  });
});
