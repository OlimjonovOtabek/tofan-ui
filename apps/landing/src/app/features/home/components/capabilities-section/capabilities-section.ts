import { Component } from '@angular/core';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { SITE_SECTIONS } from '@landing/core/config/site-sections';
import { Icon } from '@landing/shared/icon/icon';
import { CAPABILITIES } from '../../models/capabilities';
import { SectionHeading } from '../section-heading/section-heading';

@Component({
  selector: 'landing-capabilities-section',
  imports: [LandingTranslatePipe, Icon, SectionHeading],
  templateUrl: './capabilities-section.html',
  styleUrl: './capabilities-section.css',
})
export class CapabilitiesSection {
  protected readonly sectionId = SITE_SECTIONS.features;
  protected readonly capabilities = CAPABILITIES;
}
