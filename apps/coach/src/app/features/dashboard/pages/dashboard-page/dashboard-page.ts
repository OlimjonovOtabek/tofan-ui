import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { MessagePipe } from '@core/i18n/message.pipe';
import { CLIENT_FILTER_PARAM, ClientFilter } from '@coach/core/clients/client-filter';
import { PaymentRow } from '@coach/core/payments/payment-row';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { SectionCard } from '@coach/core/ui/section-card/section-card';
import { Shimmer } from '@coach/core/ui/shimmer/shimmer';
import { DashboardStore } from '../../dashboard.store';
import { DashboardPerson } from '../../models/dashboard';
import { EarningsCard } from '../../components/earnings-card/earnings-card';
import { PeopleSection } from '../../components/people-section/people-section';
import { ProgramsCard } from '../../components/programs-card/programs-card';
import { SubscribersGrid } from '../../components/subscribers-grid/subscribers-grid';

const CLIENTS_PATH = '/clients';
const PROGRAMS_PATH = '/programs';
const EARNINGS_PATH = '/profile/earnings';

@Component({
  selector: 'coach-dashboard-page',
  imports: [
    TranslatePipe,
    MessagePipe,
    PaymentRow,
    EmptyState,
    SectionCard,
    Shimmer,
    EarningsCard,
    PeopleSection,
    ProgramsCard,
    SubscribersGrid,
  ],
  providers: [DashboardStore],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  protected readonly store = inject(DashboardStore);
  private readonly router = inject(Router);

  protected readonly now = new Date();

  constructor() {
    void this.store.load();
  }

  protected openClients(filter: ClientFilter): void {
    void this.router.navigate([CLIENTS_PATH], { queryParams: { [CLIENT_FILTER_PARAM]: filter } });
  }

  protected openClient(person: DashboardPerson): void {
    void this.router.navigate([CLIENTS_PATH, person.userId]);
  }

  protected openPrograms(): void {
    void this.router.navigateByUrl(PROGRAMS_PATH);
  }

  protected openEarnings(): void {
    void this.router.navigateByUrl(EARNINGS_PATH);
  }
}
