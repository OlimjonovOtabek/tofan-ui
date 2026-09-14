import { Component } from '@angular/core';
import { StatusCard } from '@presentation/shared/components/status-card/status-card';

@Component({
  selector: 'app-not-found-page',
  imports: [StatusCard],
  template: `
    <app-status-card
      icon="pi-search"
      title="404 — Sahifa topilmadi"
      message="So'ralgan sahifa mavjud emas yoki ko'chirilgan."
    />
  `,
})
export class NotFoundPage {}
