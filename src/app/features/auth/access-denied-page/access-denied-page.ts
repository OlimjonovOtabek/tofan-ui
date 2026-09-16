import { Component } from '@angular/core';
import { StatusCard } from '@shared/components/status-card/status-card';

@Component({
  selector: 'app-access-denied-page',
  imports: [StatusCard],
  template: `
    <app-status-card
      icon="pi-lock"
      accent="warn"
      title="Ruxsat yo'q"
      message="Bu sahifani ko'rish uchun huquqingiz yetarli emas. Administratorga murojaat qiling."
    />
  `,
})
export class AccessDeniedPage {}
