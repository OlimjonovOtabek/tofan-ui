import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { CoachProfileService } from '@coach/core/profile/coach-profile.service';

export const coachProfileGuard: CanActivateFn = async (_route, state) => {
  const router = inject(Router);
  const service = inject(CoachProfileService);
  if (state.url.startsWith('/onboarding')) {
    return true;
  }
  try {
    await service.get();
    return true;
  } catch (error) {
    return error instanceof NotFoundError ? router.createUrlTree(['/onboarding']) : true;
  }
};
