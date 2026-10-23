import { Component, inject } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { StatusPage } from '../status-page/status-page';

@Component({
  selector: 'coach-onboarding-page',
  imports: [TranslatePipe, StatusPage],
  template: `
    <coach-status-page
      icon="user"
      [title]="'coachApp.access.missingProfileTitle' | t"
      [message]="'coachApp.access.missingProfileMessage' | t"
      [actionLabel]="'coachApp.logout.logout' | t"
      (action)="signOut()"
    />
  `,
})
export class CoachOnboardingPage {
  private readonly auth = inject(AuthStore);

  protected signOut(): void {
    void this.auth.logout();
  }
}
