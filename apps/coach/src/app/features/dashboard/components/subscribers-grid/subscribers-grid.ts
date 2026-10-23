import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ClientFilter } from '@coach/core/clients/client-filter';
import { MetricTile } from '@coach/core/ui/metric-tile/metric-tile';
import { SubscriberStats } from '../../models/dashboard';

@Component({
  selector: 'coach-subscribers-grid',
  imports: [TranslatePipe, MetricTile],
  templateUrl: './subscribers-grid.html',
  styleUrl: './subscribers-grid.css',
})
export class SubscribersGrid {
  readonly stats = input.required<SubscriberStats>();
  readonly openClients = output<ClientFilter>();
}
