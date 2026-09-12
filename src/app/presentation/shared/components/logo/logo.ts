import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Brand mark placeholder taken from Sakai. Swap the SVG for the Tofan logo. */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logo.html',
  host: { class: 'inline-flex' },
})
export class Logo {}
