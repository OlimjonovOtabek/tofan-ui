import { Component, computed, inject } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  private readonly authStore = inject(AuthStore);

  protected readonly greeting = computed(() => {
    const name = this.authStore.displayName();
    return name ? `Xush kelibsiz, ${name}` : 'Xush kelibsiz';
  });
}
