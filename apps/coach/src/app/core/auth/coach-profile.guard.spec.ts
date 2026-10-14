import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { CoachProfileService } from '@coach/core/profile/coach-profile.service';
import { coachProfileGuard } from './coach-profile.guard';

describe('coachProfileGuard', () => {
  let router: Pick<Router, 'createUrlTree'>;
  let service: Pick<CoachProfileService, 'get'>;

  beforeEach(() => {
    router = { createUrlTree: vi.fn().mockReturnValue({ destination: '/onboarding' }) };
    service = { get: vi.fn().mockResolvedValue({}) };
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: CoachProfileService, useValue: service },
      ],
    });
  });

  it('should allow navigation when the trainer card exists', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      coachProfileGuard({} as never, { url: '/programs' } as never),
    );

    expect(result).toBe(true);
  });

  it('should send a trainer without a card to the onboarding page', async () => {
    vi.mocked(service.get).mockRejectedValue(new NotFoundError('Trainer card not found.', 'Trainer.NotFound'));

    const result = await TestBed.runInInjectionContext(() =>
      coachProfileGuard({} as never, { url: '/programs' } as never),
    );

    expect(router.createUrlTree).toHaveBeenCalledWith(['/onboarding']);
    expect(result).toEqual({ destination: '/onboarding' });
  });

  it('should allow onboarding without requesting the profile endpoint', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      coachProfileGuard({} as never, { url: '/onboarding' } as never),
    );

    expect(result).toBe(true);
    expect(service.get).not.toHaveBeenCalled();
  });
});
