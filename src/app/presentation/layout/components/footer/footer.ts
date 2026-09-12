import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="layout-footer">TOFAN &copy; {{ year }}</div>`,
})
export class Footer {
  protected readonly year = new Date().getFullYear();
}
