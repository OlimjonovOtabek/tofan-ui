import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { programLeaveGuard } from './program-leave.guard';

describe('programLeaveGuard', () => {
  const run = (canLeave: boolean) =>
    programLeaveGuard(
      { canLeave: () => Promise.resolve(canLeave) },
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
      {} as RouterStateSnapshot,
    );

  it('should follow what the page answers', async () => {
    await expect(run(true)).resolves.toBe(true);
    await expect(run(false)).resolves.toBe(false);
  });
});
