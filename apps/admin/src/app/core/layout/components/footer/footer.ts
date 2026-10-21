import { Component } from '@angular/core';
import { Logo } from '@shared/components/logo/logo';

@Component({
  selector: 'app-footer',
  imports: [Logo],
  template: `
    <div class="layout-footer">
      <div class="footer-logo-container">
        <app-logo class="h-6" />
        <span class="footer-app-name">TOFAN</span>
      </div>
      <span class="footer-copyright">&copy; {{ year }}</span>
    </div>
  `,
})
export class Footer {
  protected readonly year = new Date().getFullYear();
}
