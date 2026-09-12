import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StatusCard } from '@presentation/shared/components/status-card/status-card';

@Component({
  selector: 'app-error-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusCard],
  template: `
    <app-status-card
      icon="pi-exclamation-circle"
      accent="danger"
      title="Xatolik yuz berdi"
      message="So'rovni bajarib bo'lmadi. Birozdan so'ng qayta urinib ko'ring."
    />
  `,
})
export class ErrorPage {}
