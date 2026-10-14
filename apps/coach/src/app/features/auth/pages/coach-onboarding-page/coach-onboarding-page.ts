import { Card } from '@openng/optimus-ui/card';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Component, inject } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'coach-onboarding-page',
  imports: [Card, ButtonDirective, TranslatePipe],
  templateUrl: './coach-onboarding-page.html',
  styleUrl: './coach-onboarding-page.css',
})
export class CoachOnboardingPage {
  private readonly auth = inject(AuthStore);

  protected signOut(): void {
    void this.auth.logout();
  }
}
