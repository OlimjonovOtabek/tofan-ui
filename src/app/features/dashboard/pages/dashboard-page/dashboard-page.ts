import { Component, inject } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-dashboard-page',
  imports: [TranslatePipe],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  protected readonly authStore = inject(AuthStore);
}
