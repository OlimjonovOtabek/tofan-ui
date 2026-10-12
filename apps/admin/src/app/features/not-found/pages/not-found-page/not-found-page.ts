import { Component } from '@angular/core';
import { StatusCard } from '@core/layout/components/status-card/status-card';

@Component({
  selector: 'app-not-found-page',
  imports: [StatusCard],
  template: `
    <app-status-card
      icon="pi-search"
      title="layout.status.notFoundTitle"
      message="layout.status.notFoundMessage"
    />
  `,
})
export class NotFoundPage {}
