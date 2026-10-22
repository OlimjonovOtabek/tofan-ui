import { Component } from '@angular/core';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { SITE_SECTIONS } from '@landing/core/config/site-sections';
import { Icon } from '@landing/shared/icon/icon';
import { FAQ_ITEMS } from '../../models/faq-items';
import { SectionHeading } from '../section-heading/section-heading';

const FAQ_GROUP = 'faq';

@Component({
  selector: 'landing-faq-section',
  imports: [LandingTranslatePipe, Icon, SectionHeading],
  templateUrl: './faq-section.html',
  styleUrl: './faq-section.css',
})
export class FaqSection {
  protected readonly sectionId = SITE_SECTIONS.faq;
  protected readonly items = FAQ_ITEMS;
  protected readonly group = FAQ_GROUP;
}
