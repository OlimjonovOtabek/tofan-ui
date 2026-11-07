import { CanDeactivateFn } from '@angular/router';

export interface LeavableProgramPage {
  canLeave(): Promise<boolean>;
}

export const programLeaveGuard: CanDeactivateFn<LeavableProgramPage> = (page) => page.canLeave();
