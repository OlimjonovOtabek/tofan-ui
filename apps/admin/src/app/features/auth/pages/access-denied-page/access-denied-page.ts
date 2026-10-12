import { Component } from '@angular/core';
import { StatusCard } from '@core/layout/components/status-card/status-card';

@Component({
  selector: 'app-access-denied-page',
  imports: [StatusCard],
  template: `
    <app-status-card
      icon="pi-lock"
      accent="warn"
      title="layout.status.accessDeniedTitle"
      message="layout.status.accessDeniedMessage"
    />
  `,
})
export class AccessDeniedPage {}
