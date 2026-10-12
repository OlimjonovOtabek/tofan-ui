import { Component } from '@angular/core';
import { StatusCard } from '@core/layout/components/status-card/status-card';

@Component({
  selector: 'app-error-page',
  imports: [StatusCard],
  template: `
    <app-status-card
      icon="pi-exclamation-circle"
      accent="danger"
      title="layout.status.errorTitle"
      message="layout.status.errorMessage"
    />
  `,
})
export class ErrorPage {}
