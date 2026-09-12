import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthStore } from '@presentation/auth/auth.store';

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  private readonly authStore = inject(AuthStore);

  protected readonly greeting = computed(() => {
    const name = this.authStore.displayName();
    return name ? `Xush kelibsiz, ${name}` : 'Xush kelibsiz';
  });
}
