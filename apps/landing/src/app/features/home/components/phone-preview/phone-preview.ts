import { Component } from '@angular/core';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { Icon } from '@landing/shared/icon/icon';
import { PHONE_PLAN, PHONE_STATS } from '../../models/phone-preview';

@Component({
  selector: 'landing-phone-preview',
  imports: [LandingTranslatePipe, Icon],
  templateUrl: './phone-preview.html',
  styleUrl: './phone-preview.css',
  host: { 'aria-hidden': 'true' },
})
export class PhonePreview {
  protected readonly stats = PHONE_STATS;
  protected readonly plan = PHONE_PLAN;
}
