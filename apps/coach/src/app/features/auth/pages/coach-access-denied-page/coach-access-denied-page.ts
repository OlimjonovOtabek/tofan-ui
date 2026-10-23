import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { StatusPage } from '../status-page/status-page';

@Component({
  selector: 'coach-access-denied-page',
  imports: [TranslatePipe, StatusPage],
  template: `
    <coach-status-page
      icon="lock"
      [title]="'coachApp.access.deniedTitle' | t"
      [message]="'coachApp.access.deniedMessage' | t"
      [actionLabel]="'coachApp.signIn.submit' | t"
      (action)="toSignIn()"
    />
  `,
})
export class CoachAccessDeniedPage {
  private readonly router = inject(Router);

  protected toSignIn(): void {
    void this.router.navigateByUrl('/auth/login');
  }
}
