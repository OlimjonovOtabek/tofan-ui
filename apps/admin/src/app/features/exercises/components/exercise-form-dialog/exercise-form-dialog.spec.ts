import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/http/api-base-url';
import { MessageService } from '@openng/optimus-ui/api';
import { Exercise } from '../../models/exercise';
import { ExerciseFormDialog } from './exercise-form-dialog';

const SIGNED_URL = '/api/files/8a0/content?expires=1&signature=x';

function exercise(videoFileId: string | null, videoUrl: string | null): Exercise {
  return new Exercise(
    '7',
    { en: 'Squat', uz: 'Skvat', ru: 'Приседание' },
    'quadriceps',
    'barbell',
    'intermediate',
    'strength',
    'any',
    true,
    false,
    true,
    null,
    videoFileId,
    videoUrl,
  );
}

describe('ExerciseFormDialog video player', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        MessageService,
      ],
    });
  });

  async function open(value: Exercise | null): Promise<ComponentFixture<ExerciseFormDialog>> {
    const fixture = TestBed.createComponent(ExerciseFormDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('exercise', value);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function player(): HTMLVideoElement | null {
    return document.body.querySelector('video');
  }

  afterEach(() => {
    TestBed.resetTestingModule();
    document.body.innerHTML = '';
  });

  it('should play the saved video from its signed url when an exercise with a video opens', async () => {
    await open(exercise('8a0', SIGNED_URL));

    expect(player()?.getAttribute('src')).toBe(SIGNED_URL);
  });

  it('should show no player when the exercise has no video', async () => {
    await open(exercise(null, null));

    expect(player()).toBeNull();
  });

  it('should show no player when a new exercise is created', async () => {
    await open(null);

    expect(player()).toBeNull();
  });

  it('should hide the player when the video file is replaced by an upload', async () => {
    const fixture = await open(exercise('8a0', SIGNED_URL));

    fixture.componentInstance['videoFileId'].set('c71');
    fixture.detectChanges();

    expect(player()).toBeNull();
  });

  it('should explain the failure when the saved video cannot be loaded', async () => {
    const fixture = await open(exercise('8a0', SIGNED_URL));

    player()?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(player()).toBeNull();
    expect(document.body.textContent).toContain("Videoni yuklab bo'lmadi");
  });
});
