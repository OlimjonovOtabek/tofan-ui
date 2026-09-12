import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StatusCard } from '@presentation/shared/components/status-card/status-card';

@Component({
  selector: 'app-access-denied-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
